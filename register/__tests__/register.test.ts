import 'reflect-metadata';
import { graphql, GraphQLError } from 'graphql';

import schema from '../../schema';

import { IRegistrationDetails } from '..';

jest.mock('../../logger');
jest.mock('../../config', () => ({
    get: (name: string) => name,
}));

const STUB_STRIPE_PRICES = {
    object: 'list',
    data: [
        {
            id: 'price_1Iw2R3CYyIPWwVWID44yDnV9',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195817,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '51',
                upperlimit: '199',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 49900,
            unit_amount_decimal: '49900',
        },
        {
            id: 'price_1Iw2R2CYyIPWwVWIJoX56JMX',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195816,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '200',
                upperlimit: '499',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 64900,
            unit_amount_decimal: '64900',
        },
        {
            id: 'price_1Iw2R0CYyIPWwVWIEqQOd9Zr',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195814,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '1000',
                upperlimit: '999999',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 94900,
            unit_amount_decimal: '94900',
        },
        {
            id: 'price_1Iw2QyCYyIPWwVWIVJN6AW80',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195812,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '500',
                upperlimit: '999',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 79900,
            unit_amount_decimal: '79900',
        },
        {
            id: 'price_1Iw2QuCYyIPWwVWIcrwi7l8L',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195808,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '31',
                upperlimit: '50',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 34900,
            unit_amount_decimal: '34900',
        },
        {
            id: 'price_1Iw2QsCYyIPWwVWIZdkn8CEz',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195806,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '16',
                upperlimit: '30',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 29900,
            unit_amount_decimal: '29900',
        },
        {
            id: 'price_1Iw2QqCYyIPWwVWIt5fYf5LL',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195804,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '10',
                upperlimit: '15',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 24900,
            unit_amount_decimal: '24900',
        },
        {
            id: 'price_1Iw2QoCYyIPWwVWIkuwmcmVH',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195802,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '5',
                upperlimit: '9',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 19900,
            unit_amount_decimal: '19900',
        },
        {
            id: 'price_1Iw2QnCYyIPWwVWI5r5eCq0q',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195801,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '1',
                upperlimit: '4',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 14900,
            unit_amount_decimal: '14900',
        },
        {
            id: 'price_1Iw2QlCYyIPWwVWIYWgG3xSa',
            object: 'price',
            active: true,
            billing_scheme: 'per_unit',
            created: 1622195799,
            currency: 'gbp',
            livemode: false,
            lookup_key: null,
            metadata: {
                lowerlimit: '0',
                upperlimit: '0',
            },
            nickname: null,
            product: 'prod_JZAmvBgq4Za4r2',
            recurring: null,
            tiers_mode: null,
            transform_quantity: null,
            type: 'one_time',
            unit_amount: 9900,
            unit_amount_decimal: '9900',
        },
    ],
    has_more: false,
    url: '/v1/prices',
};

const registrationDetails: IRegistrationDetails = {
    numberOfEmployees: 100,
    firstName: 'first-name',
    lastName: 'last-name',
    email: 'email',
    mobileNumber: '+447000000000',
    companyName: 'company-name',
    companyAddressLine1: 'company-address-line1',
    companyAddressLine2: 'company-address-line2',
    companyTownCity: 'company-town-city',
    companyCounty: 'company-county',
    companyPostcode: 'company-postcode',
    isDifferentAddress: false,
    billingName: 'billing-name',
    billingAddressLine1: 'billing-address-line1',
    billingAddressLine2: 'billing-address-line2',
    billingTownCity: 'billing-town-city',
    billingCounty: 'billing-county',
    billingPostcode: 'billing-postcode',
    hasOptedForEmailContact: false,
    hasOptedForPhoneContact: false,
    hasOptedForTextContact: false,
    hasOptedForPostContact: false,
    hasAcceptedTerms: true,
    referralCode: 'a-referral-code',
    bacs: false,
    originPortal: 'public',
    hasPurchaseOrderNumber: false,
};

describe('Register mutation', () => {
    describe('Non-moto flow', () => {
        describe('Create payment customer', () => {
            let context: any;
            let mutation: string;
            beforeEach(() => {
                context = {
                    stripe: {
                        subscriptions: {
                            create: jest.fn().mockResolvedValue({ client_secret: 'payment_intent_client_secret' }),
                        },
                        paymentIntents: {
                            create: jest.fn().mockResolvedValue({ client_secret: 'setup_intent_client_secret' }),
                            update: jest.fn().mockResolvedValue({ client_secret: 'setup_intent_client_secret' }),
                        },
                        customers: {
                            create: jest.fn().mockResolvedValue({ id: '12345' }),
                            search: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        prices: { list: jest.fn().mockResolvedValue(STUB_STRIPE_PRICES) },
                        invoices: {
                            create: jest.fn(),
                            finalizeInvoice: jest.fn(),
                        },
                        invoiceItems: {
                            create: jest.fn().mockResolvedValue({ id: 'new-customer' }),
                        },
                    },
                };
                mutation = `
                mutation CreatePaymentCustomer($registrationDetails: RegistrationDetails!) {
                    createPaymentCustomer(registrationDetails: $registrationDetails) {
                        stripeCustomerId
                        clientSecret
                    }
                }
            `;
            });

            it('should return error when Stripe createCustomer resolves with an error', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: 'nah' });

                const response = await graphql(schema, mutation, null, context, { registrationDetails });

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to create Stripe customer')],
                });
            });

            it('should include the customer options for communication as string values', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: {
                        ...registrationDetails,
                        hasOptedForEmailContact: true,
                        hasOptedForTextContact: true,
                    },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: registrationDetails.mobileNumber,
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: registrationDetails.mobileNumber,
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'yes',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'yes',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure phone number is a UK phone number with a country code prepended', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '07000000000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure country code is not prepended when already provided', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+447000000000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure that no 0 appears after the country code', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+4407000000000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure that 0 is not removed after the country code appearing later in the number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+4407000044000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000044000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000044000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure that no symbols other than + are present in the number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+44(0)700$0-00+0!000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure any letters are stripped out of any provided number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+44700a0b0c0d0000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure spaces are stripped out of any provided number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+447000 000 000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should call Stripe createCustomer with registrationDetails', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, { registrationDetails });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should call Stripe createCustomer with null referral code if not provided', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, referralCode: undefined },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: 'empty',
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should return stripeCustomerId and clientSecret for a successful request', async () => {
                const stripeCustomerId = '123';
                const clientSecret = '456';

                context.stripe.customers.create.mockResolvedValue({
                    error: null,
                    id: stripeCustomerId,
                    client_secret: clientSecret,
                });

                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'new-customer' });
                context.stripe.invoices.create.mockResolvedValue({ id: 'invoice_id' });
                context.stripe.invoices.finalizeInvoice.mockResolvedValue({ id: 'invoice_id' });
                context.stripe.paymentIntents.update.mockResolvedValue({
                    error: null,
                    id: stripeCustomerId,
                    client_secret: clientSecret,
                });

                const response = await graphql(schema, mutation, null, context, { registrationDetails });
                expect(response).toEqual({
                    data: {
                        createPaymentCustomer: {
                            clientSecret,
                            stripeCustomerId,
                        },
                    },
                });
            });
        });
    });

    describe('Moto flow', () => {
        describe('Create payment customer', () => {
            let context: any;
            let mutation: string;
            beforeEach(() => {
                context = {
                    stripe: {
                        subscriptions: {
                            create: jest.fn().mockResolvedValue({ client_secret: 'payment_intent_client_secret' }),
                        },
                        customers: {
                            create: jest.fn().mockResolvedValue({ id: '12345' }),
                            search: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        prices: { list: jest.fn().mockResolvedValue(STUB_STRIPE_PRICES) },
                    },
                };
                mutation = `
                mutation CreateMotoPaymentCustomer($registrationDetails: RegistrationDetails!) {
                    createMotoPaymentCustomer(registrationDetails: $registrationDetails) {
                        stripeCustomerId
                    }
                }
            `;
            });

            it('should return error when Stripe createCustomer resolves with an error', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: 'nah' });

                const response = await graphql(schema, mutation, null, context, { registrationDetails });

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to create Stripe customer')],
                });
            });

            it('should ensure phone number is a UK phone number with a country code prepended', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '07000000000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure country code is not prepended when already provided', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+447000000000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure that no 0 appears after the country code', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+4407000000000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure that 0 is not removed after the country code appearing later in the number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+4407000044000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000044000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000044000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure that no symbols other than + are present in the number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+44(0)700$0-00+0!000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure any letters are stripped out of any provided number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+44700a0b0c0d0000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should ensure spaces are stripped out of any provided number', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, mobileNumber: '+447000 000 000' },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should call Stripe createCustomer with registrationDetails', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, { registrationDetails });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: registrationDetails.referralCode,
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should call Stripe createCustomer with null referral code if not provided', async () => {
                context.stripe.customers.create.mockResolvedValue({ error: null, id: '123' });

                await graphql(schema, mutation, null, context, {
                    registrationDetails: { ...registrationDetails, referralCode: undefined },
                });

                expect(context.stripe.customers.create).toBeCalledWith({
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
                        phone: '+447000000000',
                    },
                    metadata: {
                        contact_firstname: registrationDetails.firstName,
                        contact_lastname: registrationDetails.lastName,
                        contact_email: registrationDetails.email,
                        contact_phone: '+447000000000',
                        num_employees: registrationDetails.numberOfEmployees,
                        referral_code: 'empty',
                        has_opted_for_email_contact: 'no',
                        has_opted_for_phone_contact: 'no',
                        has_opted_for_text_contact: 'no',
                        has_opted_for_post_contact: 'no',
                        initialSubscriptionIsBacsPayment: 'false',
                        origin_portal: registrationDetails.originPortal,
                    },
                });
            });

            it('should return stripeCustomerId for a successful request', async () => {
                const stripeCustomerId = '123';
                context.stripe.customers.create.mockResolvedValue({ error: null, id: stripeCustomerId });

                const response = await graphql(schema, mutation, null, context, { registrationDetails });
                expect(response).toEqual({
                    data: {
                        createMotoPaymentCustomer: {
                            stripeCustomerId,
                        },
                    },
                });
            });
        });

        describe('Make payment', () => {
            let context: any;
            let mutation: string;
            const customerId = 'customer_id';
            const paymentMethodId = 'pm_id';
            registrationDetails['numberOfEmployees'] = 15;
            const parameters = { customerId, paymentMethodId, registrationDetails };
            beforeEach(() => {
                context = {
                    environment: { ENVIRONMENT_NAME: 'environment-name' },
                    stripe: {
                        subscriptions: {
                            create: jest.fn(),
                        },
                        setupIntents: {
                            create: jest.fn(),
                        },
                        customers: { update: jest.fn(), search: jest.fn().mockResolvedValue({ data: [] }) },
                        invoices: {
                            create: jest.fn(),
                        },
                        invoiceItems: {
                            create: jest.fn().mockResolvedValue({ id: 'new-customer' }),
                        },
                        prices: { list: jest.fn() },
                    },
                };
                mutation = `
                mutation MakeMotoPayment($paymentMethodId: String!, $customerId: String!, $registrationDetails: RegistrationDetails!) {
                    makeMotoPayment(paymentMethodId: $paymentMethodId, customerId: $customerId, registrationDetails: $registrationDetails)
                }
            `;
            });

            it('should call Stripe setupIntent with customerId and paymentMethodId and enable future payments', async () => {
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'new-customer' });
                context.stripe.invoices.create.mockResolvedValue({ id: 'invoice_id' });

                await graphql(schema, mutation, null, context, parameters);

                expect(context.stripe.setupIntents.create).toBeCalledWith({
                    payment_method: paymentMethodId,
                    usage: 'off_session',
                    customer: customerId,
                    payment_method_options: {
                        card: { moto: true },
                    },
                    confirm: true,
                });
            });

            it('should call Stripe customers with customerId and paymentId update the default payment method', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ error: null, id: 'intent_id' });
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'new-customer' });
                context.stripe.invoices.create.mockResolvedValue({ id: 'invoice_id' });

                await graphql(schema, mutation, null, context, parameters);

                expect(context.stripe.customers.update).toBeCalledWith(customerId, {
                    invoice_settings: { default_payment_method: paymentMethodId },
                });
            });

            it('should call Stripe Invoice with customerId, environmentName and priceId', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ error: null, id: 'intent_id' });
                context.stripe.customers.update.mockResolvedValue({ error: null, id: 'customer_id' });
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'new-customer' });

                registrationDetails['numberOfEmployees'] = 15;
                await graphql(schema, mutation, null, context, { customerId, paymentMethodId, registrationDetails });

                expect(context.stripe.invoices.create).toBeCalledWith({
                    customer: customerId,
                    metadata: {
                        ENVIRONMENT_NAME: context.environment.ENVIRONMENT_NAME,
                        PRICE_ID: 'price_1Iw2QqCYyIPWwVWIt5fYf5LL',
                    },
                    default_tax_rates: ['stripe.vatTaxId'],
                });
            });

            it('should call Stripe Invoice with correct amount based on number of employees', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ error: null, id: 'intent_id' });
                context.stripe.customers.update.mockResolvedValue({ error: null, id: 'customer_id' });
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'invoice_id' });

                registrationDetails['numberOfEmployees'] = 1;
                await graphql(schema, mutation, null, context, { customerId, paymentMethodId, registrationDetails });

                expect(context.stripe.invoices.create).toBeCalledWith({
                    customer: customerId,
                    metadata: {
                        ENVIRONMENT_NAME: context.environment.ENVIRONMENT_NAME,
                        PRICE_ID: 'price_1Iw2QnCYyIPWwVWI5r5eCq0q',
                    },
                    default_tax_rates: ['stripe.vatTaxId'],
                });

                registrationDetails['numberOfEmployees'] = 50;

                await graphql(schema, mutation, null, context, { customerId, paymentMethodId, registrationDetails });

                expect(context.stripe.invoices.create).toBeCalledWith({
                    customer: customerId,
                    metadata: {
                        ENVIRONMENT_NAME: context.environment.ENVIRONMENT_NAME,
                        PRICE_ID: 'price_1Iw2QuCYyIPWwVWIcrwi7l8L',
                    },
                    default_tax_rates: ['stripe.vatTaxId'],
                });
            });

            it('should return error when Stripe setupIntent resolves with an error', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ id: null });
                context.stripe.customers.update.mockResolvedValue({ error: null, id: 'customer_id' });
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'invoice_id' });
                context.stripe.invoices.create.mockResolvedValue({ id: 'invoice_id' });

                const response = await graphql(schema, mutation, null, context, parameters);

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to create Stripe setup intent')],
                });
            });

            it('should return error when Stripe update customer resolves with an error', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ error: null, id: 'intent_id' });
                context.stripe.customers.update.mockResolvedValue({ id: null });
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'invoice_id' });
                context.stripe.invoices.create.mockResolvedValue({ id: 'invoice_id' });

                const response = await graphql(schema, mutation, null, context, parameters);

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to add payment method to Stripe customer')],
                });
            });

            it('should return error when Stripe Invoice resolves with an error', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ id: 'intent_id' });
                context.stripe.customers.update.mockResolvedValue({ id: 'intent_id' });
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.invoiceItems.create.mockResolvedValue({ id: 'invoice_id' });
                context.stripe.invoices.create.mockResolvedValue({ id: null });

                const response = await graphql(schema, mutation, null, context, parameters);
                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to create a Stripe invoice')],
                });
            });
        });
    });

    describe('Switch from Bacs to External Card', () => {
        describe('Update Existing Customer', () => {
            let context: any;
            let mutation: string;

            const customerId = 'customer_id';

            beforeEach(() => {
                context = {
                    stripe: {
                        paymentIntents: {
                            create: jest.fn().mockResolvedValue({ client_secret: 'setup_intent_client_secret' }),
                            update: jest.fn().mockResolvedValue({ client_secret: 'setup_intent_client_secret' }),
                        },
                        customers: {
                            update: jest.fn().mockResolvedValue({ id: '12345' }),
                            listPaymentMethods: jest.fn(),
                        },
                        prices: { list: jest.fn() },
                        paymentMethods: { attach: jest.fn() },
                        invoices: {
                            retrieve: jest.fn(),
                        },
                    },
                };
                mutation = `
                mutation UpdateExistingCustomer($customerId: String!, $registrationDetails: RegistrationDetails!) {
                    updateExistingCustomer(customerId: $customerId, registrationDetails: $registrationDetails) {
                        clientSecret
                    }
                }
            `;
            });

            it('should return error when Stripe updateExistingCustomer resolves with an error', async () => {
                context.stripe.customers.listPaymentMethods.mockResolvedValue({ error: 'nah' });
                context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.paymentIntents.create.mockResolvedValue({ error: 'nah' });
                context.stripe.customers.update.mockResolvedValue({ error: 'nah' });
                const response = await graphql(schema, mutation, null, context, { customerId, registrationDetails });

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to update Stripe customer')],
                });
            });

            it('should return clientSecret for a successful request', async () => {
                const stripeCustomerId = '123';
                const clientSecret = '456';
                context.stripe.customers.listPaymentMethods.mockResolvedValue({ id: 'PM_ID' });
                // context.stripe.prices.list.mockResolvedValue(STUB_STRIPE_PRICES);
                context.stripe.customers.update.mockResolvedValue({
                    error: null,
                    id: customerId,
                });
                context.stripe.invoices.retrieve.mockResolvedValue({ id: 'in_123' });

                context.stripe.paymentIntents.update.mockResolvedValue({
                    error: null,
                    id: stripeCustomerId,
                    client_secret: clientSecret,
                });

                const response = await graphql(schema, mutation, null, context, { customerId, registrationDetails });
                expect(response).toEqual({
                    data: {
                        updateExistingCustomer: {
                            clientSecret,
                        },
                    },
                });
            });
        });
    });
    describe('Switch from Bacs to Internal Card', () => {
        describe('Update Existing Moto Customer', () => {
            let context: any;
            let mutation: string;

            const customerId = 'customer_id';

            beforeEach(() => {
                context = {
                    stripe: {
                        customers: {
                            update: jest.fn().mockResolvedValue({ id: '12345' }),
                        },
                    },
                };
                mutation = `
                mutation UpdateExistingMotoPaymentCustomer($customerId: String!, $registrationDetails: RegistrationDetails!) {
                    updateExistingMotoPaymentCustomer(customerId: $customerId, registrationDetails: $registrationDetails) {
                        stripeCustomerId
                    }
                }
            `;
            });

            it('should return error when Stripe updateExistingMotoPaymentCustomer resolves with an error', async () => {
                context.stripe.customers.update.mockResolvedValue({ error: 'nah' });
                const response = await graphql(schema, mutation, null, context, { customerId, registrationDetails });

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to update Stripe customer')],
                });
            });

            it('should return stripeCustomerId for a successful request', async () => {
                const stripeCustomerId = 'customer_id';

                context.stripe.customers.update.mockResolvedValue({
                    error: null,
                    id: customerId,
                });

                const response = await graphql(schema, mutation, null, context, { customerId, registrationDetails });
                expect(response).toEqual({
                    data: {
                        updateExistingMotoPaymentCustomer: {
                            stripeCustomerId,
                        },
                    },
                });
            });
        });

        describe('Make payment for payExistingMotoInvoice', () => {
            let context: any;
            let mutation: string;
            const customerId = 'customer_id';
            const paymentMethodId = 'pm_id';

            const parameters = { customerId, paymentMethodId, registrationDetails };
            beforeEach(() => {
                context = {
                    environment: { ENVIRONMENT_NAME: 'environment-name' },
                    stripe: {
                        invoices: {
                            pay: jest.fn(),
                        },
                        setupIntents: {
                            create: jest.fn(),
                        },
                        customers: { update: jest.fn() },
                    },
                };
                mutation = `
                mutation PayExistingMotoInvoice($paymentMethodId: String!, $customerId: String!, $registrationDetails: RegistrationDetails!) {
                    payExistingMotoInvoice(paymentMethodId: $paymentMethodId, customerId: $customerId, registrationDetails: $registrationDetails)
                }
            `;
            });

            it('should call Stripe setupIntent with customerId and paymentMethodId and enable future payments', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ error: null, id: 'intent_id' });
                context.stripe.customers.update.mockResolvedValue({ error: null, id: 'customer_id' });
                context.stripe.invoices.pay.mockResolvedValue({ error: null, id: 'in_id' });

                await graphql(schema, mutation, null, context, parameters);

                expect(context.stripe.setupIntents.create).toBeCalledWith({
                    payment_method: paymentMethodId,
                    usage: 'off_session',
                    customer: customerId,
                    payment_method_options: {
                        card: { moto: true },
                    },
                    confirm: true,
                });
            });

            it('should call Stripe customers with customerId and paymentId update the default payment method', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ error: null, id: 'intent_id' });
                context.stripe.customers.update.mockResolvedValue({ error: null, id: 'customer_id' });
                context.stripe.invoices.pay.mockResolvedValue({ error: null, id: 'in_id' });

                await graphql(schema, mutation, null, context, parameters);

                expect(context.stripe.customers.update).toBeCalledWith(customerId, {
                    invoice_settings: { default_payment_method: paymentMethodId },
                });
            });

            it('should return error when Stripe setupIntent resolves with an error', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ id: null });
                context.stripe.customers.update.mockResolvedValue({ id: 'customer_id' });
                context.stripe.invoices.pay.mockResolvedValue({ id: 'in_id' });

                const response = await graphql(schema, mutation, null, context, parameters);

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to create Stripe setup intent')],
                });
            });

            it('should return error when Stripe update customer resolves with an error', async () => {
                context.stripe.setupIntents.create.mockResolvedValue({ id: 'intent_id' });
                context.stripe.customers.update.mockResolvedValue({ id: null });
                context.stripe.invoices.pay.mockResolvedValue({ id: 'in_id' });

                const response = await graphql(schema, mutation, null, context, parameters);

                expect(response).toEqual({
                    data: null,
                    errors: [new GraphQLError('Failed to add payment method to Stripe customer')],
                });
            });
        });
    });
});
