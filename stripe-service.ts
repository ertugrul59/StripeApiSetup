import Stripe from 'stripe';
import orderBy from 'lodash/orderBy';
import config from '../config';
import { IBacsPaymentMetaData, IRegistrationDetails } from '../register';
import { isInRange, reformatPhoneNumber } from '../utils';

export interface IInvoicePrice {
    id: string;
    amountExVAT: number;
    amountVAT: number;
    amountIncVAT: number;
    amountIncVATPence: number;
}

const VAT_RATE = 0.2;
const stripe = new Stripe(config.get('stripe.apiKey'), { apiVersion: config.get('stripe.apiVersion') });
const productId = config.get('stripe.productId');

const getPriceInfo = (stripePrices: Stripe.Price[], numEmployees: number): { id: string; amount: number } => {
    const stripeOnlyRecurring = stripePrices.filter((priceObj) => priceObj.type === 'one_time');
    const orderedStripePrices = orderBy(
        stripeOnlyRecurring,
        ['metadata.lowerlimit', 'metadata.upperlimit'],
        ['asc', 'asc'],
    );

    if (orderedStripePrices.length === 0) {
        throw new Error('NO_PRICES_PROVIDED');
    }

    const found = orderedStripePrices.find((stripePrice) => {
        const metadata = stripePrice.metadata as { lowerlimit: string; upperlimit: string };
        return isInRange(numEmployees, +metadata?.lowerlimit, parseInt(metadata?.upperlimit));
    });
    const { id, unit_amount } = found ?? orderedStripePrices[orderedStripePrices.length - 1]; // Fallback to the most expensive

    if (unit_amount === null || unit_amount === undefined) {
        throw new Error('NO_PRICE_DETERMINED');
    }

    return { id, amount: unit_amount };
};

export const getPriceList = async (injectedStripe?: Stripe): Promise<Stripe.ApiList<Stripe.Price>> => {
    const t = await (injectedStripe || stripe).prices.list({
        product: productId,
        limit: 20,
        active: true,
    });

    return t;
};

export const calculateAmounts = async (numEmployees: number, injectedStripe?: Stripe): Promise<IInvoicePrice> => {
    const stripePrices = await getPriceList(injectedStripe);

    const { id, amount } = getPriceInfo(stripePrices.data, numEmployees);

    const amountExVATPence = amount;
    const amountVATPence = amountExVATPence * VAT_RATE;
    const amountIncVATPence = amountExVATPence + amountVATPence;

    const amountExVAT = amountExVATPence / 100;
    const amountVAT = amountVATPence / 100;
    const amountIncVAT = amountIncVATPence / 100;

    return { id, amountExVAT, amountVAT, amountIncVAT, amountIncVATPence };
};

export const getOrCreateStripeCustomer = async (
    registrationDetails: IRegistrationDetails,
    injectedStripe?: Stripe,
): Promise<Stripe.Customer | Record<string, string>> => {
    const existingCustomer = await getStripeCustomer(registrationDetails, injectedStripe);

    if (existingCustomer !== undefined) {
        return existingCustomer;
    }

    return createStripeCustomer(registrationDetails, injectedStripe);
};

const getStripeCustomer = async (
    registrationDetails: IRegistrationDetails,
    injectedStripe?: Stripe,
): Promise<Stripe.Customer | undefined> => {
    // ensure malicious user can't find a random user
    try {
        if (registrationDetails.referralCode === 'empty') {
            return;
        }
        const customer = await (injectedStripe || stripe).customers.search({
            query: `metadata["referral_code"]:"${registrationDetails.referralCode}"`,
        });
        if (customer?.data.length) {
            return customer.data[0];
        }
    } catch (err: any) {
        console.error(err.message);
        return;
    }
};

export const createStripeCustomer = async (
    registrationDetails: IRegistrationDetails,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Customer> | Record<string, string>> => {
    const number = reformatPhoneNumber(registrationDetails.mobileNumber);
    const booleanToText = (value: boolean) => (value ? 'yes' : 'no');

    let stripeCustomer: Stripe.Response<Stripe.Customer> | Record<string, string> = {};
    let bacsDetails: IBacsPaymentMetaData = {
        initialSubscriptionIsBacsPayment: 'false',
    };

    try {
        const { id } = await calculateAmounts(+registrationDetails.numberOfEmployees, injectedStripe);

        if (registrationDetails.bacs) {
            bacsDetails = {
                initialSubscriptionIsBacsPayment: 'true',
                initialSubscriptionPriceId: id,
            };
        }
        stripeCustomer = await (injectedStripe || stripe).customers.create({
            name: registrationDetails.companyName,
            address: {
                line1: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyAddressLine1
                    : registrationDetails.billingAddressLine1 ?? ``,
                line2: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyAddressLine2
                    : registrationDetails.billingAddressLine2 ?? ``,
                city: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyTownCity
                    : registrationDetails.billingTownCity ?? ``,
                state: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyCounty
                    : registrationDetails.billingCounty ?? ``,
                postal_code: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyPostcode
                    : registrationDetails.billingPostcode ?? ``,
            },
            shipping: {
                address: {
                    line1: registrationDetails.companyAddressLine1,
                    line2: registrationDetails.companyAddressLine2,
                    city: registrationDetails.companyTownCity,
                    state: registrationDetails.companyCounty,
                    postal_code: registrationDetails.companyPostcode,
                },
                name: registrationDetails.firstName + ' ' + registrationDetails.lastName,
                phone: `+${number}`,
            },
            ...(registrationDetails.hasPurchaseOrderNumber && {
                invoice_settings: {
                    custom_fields: [
                        {
                            name: 'Purchase order no.',
                            value: registrationDetails?.purchaseOrderNumber || '',
                        },
                    ],
                },
            }),
            metadata: {
                contact_firstname: registrationDetails.firstName,
                contact_lastname: registrationDetails.lastName,
                contact_email: registrationDetails.email,
                num_employees: registrationDetails.numberOfEmployees,
                referral_code: registrationDetails.referralCode || 'empty',
                has_opted_for_email_contact: booleanToText(registrationDetails.hasOptedForEmailContact),
                has_opted_for_phone_contact: booleanToText(registrationDetails.hasOptedForPhoneContact),
                has_opted_for_text_contact: booleanToText(registrationDetails.hasOptedForTextContact),
                has_opted_for_post_contact: booleanToText(registrationDetails.hasOptedForPostContact),
                origin_portal: registrationDetails.originPortal,
                ...(number && { contact_phone: `+${number}` }),
                ...bacsDetails,
            },
        });
    } catch (err: any) {
        console.error(err.message);

        if (err.stack) {
            console.error(err.stack);
        }
    }

    return stripeCustomer;
};

export const updateExistingStripeCustomer = async (
    customerId: string,
    registrationDetails: IRegistrationDetails,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Customer> | Record<string, string>> => {
    const number = reformatPhoneNumber(registrationDetails.mobileNumber);
    const booleanToText = (value: boolean) => (value ? 'yes' : 'no');

    let stripeCustomer: Stripe.Response<Stripe.Customer> | Record<string, string> = {};
    const bacsDetails: IBacsPaymentMetaData = {
        initialSubscriptionIsBacsPayment: registrationDetails.bacs ? 'true' : 'false',
    };

    try {
        stripeCustomer = await (injectedStripe || stripe).customers.update(customerId, {
            address: {
                line1: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyAddressLine1
                    : registrationDetails.billingAddressLine1 ?? ``,
                line2: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyAddressLine2
                    : registrationDetails.billingAddressLine2 ?? ``,
                city: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyTownCity
                    : registrationDetails.billingTownCity ?? ``,
                state: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyCounty
                    : registrationDetails.billingCounty ?? ``,
                postal_code: !registrationDetails.isDifferentAddress
                    ? registrationDetails.companyPostcode
                    : registrationDetails.billingPostcode ?? ``,
            },
            ...(registrationDetails.hasPurchaseOrderNumber && {
                invoice_settings: {
                    custom_fields: [
                        {
                            name: 'Purchase order no.',
                            value: registrationDetails?.purchaseOrderNumber || '',
                        },
                    ],
                },
            }),
            metadata: {
                contact_firstname: registrationDetails.firstName,
                contact_lastname: registrationDetails.lastName,
                contact_email: registrationDetails.email,
                num_employees: registrationDetails.numberOfEmployees,
                referral_code: registrationDetails.referralCode || 'empty',
                has_opted_for_email_contact: booleanToText(registrationDetails.hasOptedForEmailContact),
                has_opted_for_phone_contact: booleanToText(registrationDetails.hasOptedForPhoneContact),
                has_opted_for_text_contact: booleanToText(registrationDetails.hasOptedForTextContact),
                has_opted_for_post_contact: booleanToText(registrationDetails.hasOptedForPostContact),
                origin_portal: registrationDetails.originPortal,
                ...(number && { contact_phone: `+${number}` }),
                ...bacsDetails,
            },
        });
    } catch (err: any) {
        console.error(err.message);

        if (err.stack) {
            console.error(err.stack);
        }
    }

    return stripeCustomer;
};

export const removePaymentMethodsFromCustomer = async (customerId: string, injectedStripe: Stripe): Promise<void> => {
    console.info('removing payment methods');
    const currentCardPaymentMethods = await (injectedStripe || stripe).customers.listPaymentMethods(customerId, {
        type: 'card',
    });

    console.info('currentCardPaymentMethods', currentCardPaymentMethods);

    currentCardPaymentMethods?.data?.map(async (currentCardPaymentMethod) => {
        console.info('removing', currentCardPaymentMethod);
        await stripe.paymentMethods.detach(currentCardPaymentMethod.id);
    });
};

export const addPaymentMethodToCustomer = async (
    paymentMethodId: string,
    customerId: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Customer>> => {
    return (injectedStripe || stripe).customers.update(customerId, {
        invoice_settings: {
            default_payment_method: paymentMethodId,
        },
    });
};

export const payExistingInvoiceStripe = async (
    invoiceId: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Invoice>> => {
    return (injectedStripe || stripe).invoices.pay(invoiceId);
};

export const finalizeInvoiceStripe = async (
    invoiceId: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Invoice>> => {
    return (injectedStripe || stripe).invoices.finalizeInvoice(invoiceId);
};

export const paymentIntentUpdateStripe = async (
    payment_intent: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.PaymentIntent>> => {
    return (injectedStripe || stripe).paymentIntents.update(payment_intent, {
        setup_future_usage: 'off_session',
    });
};

export const createMotoStripeSetupIntent = async (
    paymentMethodId: string,
    customerId: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.SetupIntent>> => {
    return (injectedStripe || stripe).setupIntents.create({
        payment_method: paymentMethodId,
        usage: 'off_session',
        customer: customerId,
        payment_method_options: {
            card: { moto: true },
        },
        confirm: true,
    });
};

export const createStripeInvoice = async (
    stripePriceId: string,
    customerId: string,
    environmentName: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Invoice> | null> => {
    try {
        const invoiceItem = await (injectedStripe || stripe).invoiceItems.create({
            customer: customerId,
            price: stripePriceId,
        });

        if (!invoiceItem.id) {
            throw new Error('Failed to create invoiceItem');
        }

        const invoice = await (injectedStripe || stripe).invoices.create({
            customer: customerId,
            metadata: { ENVIRONMENT_NAME: environmentName, PRICE_ID: stripePriceId },
            default_tax_rates: [config.get('stripe.vatTaxId')],
        });

        return invoice;
    } catch (err: any) {
        console.error(err.message);

        if (err.stack) {
            console.error(err.stack);
        }
    }
};

export const getStripeInvoiceById = (
    stripeInvoiceId: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Invoice>> => {
    return (injectedStripe || stripe).invoices.retrieve(stripeInvoiceId);
};

export const getStripeCustomerById = async (customerId: string | null, injectedStripe?: Stripe): Promise<any> => {
    if (!customerId) return undefined;
    const customer = await (injectedStripe || stripe).customers.retrieve(customerId);
    if (customer.deleted) return undefined;
    return customer;
};

export const updatePurchaseOrderNumber = async (
    registrationDetails: IRegistrationDetails,
    invoiceId: string,
    purchase_order_number: string,
    customerId: string,
    injectedStripe?: Stripe,
): Promise<Stripe.Response<Stripe.Customer> | Record<string, string>> => {
    //   Example
    // purchase_order_number: {
    //     in_12345: "abc123",
    //     in_67890: "def456"
    //   };

    const poOfCustomer: string | undefined = purchase_order_number;
    let purchaseOrderNumberObj: any | unknown | string | undefined = {};

    try {
        if (poOfCustomer && typeof poOfCustomer === 'string') {
            purchaseOrderNumberObj = JSON.parse(poOfCustomer); // convert to object
            purchaseOrderNumberObj[invoiceId] = (registrationDetails?.purchaseOrderNumber as unknown) as string;
        } else {
            purchaseOrderNumberObj[invoiceId] = (registrationDetails?.purchaseOrderNumber as unknown) as string;
        }
    } catch (error) {
        // Catch conversion errors..
        console.log('ERROR', error);
        purchaseOrderNumberObj = poOfCustomer;
    }

    let stripeCustomer: Stripe.Response<Stripe.Customer> | Record<string, string> = {};

    if (purchaseOrderNumberObj) {
        try {
            stripeCustomer = await (injectedStripe || stripe).customers.update(customerId, {
                metadata: {
                    purchase_order_number: JSON.stringify(purchaseOrderNumberObj),
                },
            });
        } catch (err: any) {
            console.error(err.message);

            if (err.stack) {
                console.error(err.stack);
            }
        }
    }

    return stripeCustomer;
};
