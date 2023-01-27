import Stripe from 'stripe';
import { Resolver, Arg, Mutation, Ctx } from 'type-graphql';
import config from '../config';
import logger from '../logger';
import { IContext } from '../context';
import {
    IRegistrationDetails,
    RegistrationDetails,
    PayingCustomer,
    PaymentIntent,
    PaymentIntentForExistingCustomer,
} from './register.type';
import {
    addPaymentMethodToCustomer,
    payExistingInvoiceStripe,
    calculateAmounts,
    createMotoStripeSetupIntent,
    createStripeInvoice,
    getOrCreateStripeCustomer,
    updateExistingStripeCustomer,
    updatePurchaseOrderNumber,
    removePaymentMethodsFromCustomer,
    finalizeInvoiceStripe,
    paymentIntentUpdateStripe,
    getStripeInvoiceById,
} from '../services/stripe-service';

import { BacsCustomer, IBacsPaymentMetaData } from '.';

const registerLogger = logger.child({ name: 'register' });

@Resolver(() => PayingCustomer)
export default class RegisterResolver {
    @Mutation(() => BacsCustomer)
    async createBacsCustomerAndInvoice(
        @Ctx('stripe') stripe: IContext['stripe'],
        @Arg('registrationDetails', () => RegistrationDetails) registrationDetails: IRegistrationDetails,
    ): Promise<BacsCustomer> {
        registerLogger.info('start');

        if (registrationDetails.stripeCustomerId) {
            const customer = await updateExistingStripeCustomer(
                registrationDetails.stripeCustomerId,
                registrationDetails,
                stripe,
            );

            if (!customer.id) {
                throw new Error('Failed to update Stripe customer');
            }

            if (registrationDetails.hasPurchaseOrderNumber) {
                const { id: stripeCustomerId } = await updatePurchaseOrderNumber(
                    registrationDetails,
                    registrationDetails.stripeInvoiceId,
                    undefined,
                    registrationDetails.stripeCustomerId,
                    stripe,
                );

                if (!stripeCustomerId) {
                    throw new Error('Failed to update Stripe customer metadata');
                }
            }
            return { invoiceId: 'ReBacs', stripeCustomerId: registrationDetails.stripeCustomerId };
        } else {
            const customer = await getOrCreateStripeCustomer(
                {
                    ...registrationDetails,
                    bacs: true,
                },
                stripe,
            );

            if (!customer?.id) {
                throw new Error('Failed to create Stripe customer');
            }

            const meta = customer?.metadata as IBacsPaymentMetaData;

            const { initialSubscriptionPriceId, initialSubscriptionIsBacsPayment } = meta;

            if (!initialSubscriptionPriceId || !initialSubscriptionIsBacsPayment) {
                throw new Error('Failed to retrieve BACS information from customer metadata');
            }

            const invoice = await createStripeInvoice(
                initialSubscriptionPriceId,
                customer.id,
                config.get('envName'),
                stripe,
            );

            if (registrationDetails.hasPurchaseOrderNumber) {
                const { id: stripeCustomerId } = await updatePurchaseOrderNumber(
                    registrationDetails,
                    invoice.id,
                    undefined,
                    customer.id,
                    stripe,
                );

                if (!stripeCustomerId) {
                    throw new Error('Failed to update Stripe customer metadata');
                }
            }

            return { invoiceId: invoice.id, stripeCustomerId: customer.id };
        }
    }

    @Mutation(() => PaymentIntent)
    async createPaymentCustomer(
        @Ctx('stripe') stripe: IContext['stripe'],
        @Arg('registrationDetails', () => RegistrationDetails) registrationDetails: IRegistrationDetails,
    ): Promise<PaymentIntent> {
        registerLogger.info('start');

        const customer = await getOrCreateStripeCustomer(registrationDetails, stripe);

        if (!customer.id) {
            throw new Error('Failed to create Stripe customer');
        }

        const { id: stripePriceId } = await calculateAmounts(registrationDetails.numberOfEmployees, stripe);

        const invoice = await createStripeInvoice(stripePriceId, customer.id, registrationDetails.originPortal, stripe);

        if (!invoice?.id) {
            throw new Error('Failed to create a Stripe invoice');
        }

        let paymentIntent = invoice.payment_intent;

        if (invoice.status === 'draft') {
            const invoiceFinalize = await finalizeInvoiceStripe(invoice.id, stripe);

            if (!invoiceFinalize.payment_intent) {
                throw new Error('Failed to finalize Stripe invoice');
            }
            paymentIntent = invoiceFinalize.payment_intent;
        }

        const updatedPaymentIntent = await paymentIntentUpdateStripe(paymentIntent as string, stripe);

        if (!updatedPaymentIntent?.client_secret) {
            throw new Error('Failed to update payment intent');
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const metadata: Stripe.Metadata = customer.metadata;
        if (registrationDetails.hasPurchaseOrderNumber) {
            const { id: stripeCustomerId } = await updatePurchaseOrderNumber(
                registrationDetails,
                invoice.id,
                metadata?.purchase_order_number,
                customer.id,
                stripe,
            );

            if (!stripeCustomerId) {
                throw new Error('Failed to update Stripe customer metadata');
            }
        }

        return { clientSecret: updatedPaymentIntent.client_secret, stripeCustomerId: customer.id };
    }

    @Mutation(() => PaymentIntentForExistingCustomer)
    async updateExistingCustomer(
        @Ctx('stripe') stripe: IContext['stripe'],
        @Arg('customerId', () => String) customerId: string,
        @Arg('registrationDetails', () => RegistrationDetails) registrationDetails: IRegistrationDetails,
    ): Promise<PaymentIntentForExistingCustomer> {
        registerLogger.info('start');

        try {
            await removePaymentMethodsFromCustomer(registrationDetails.stripeCustomerId, stripe);
            console.info('Removed payment methods');
        } catch (e) {
            console.error('Failed to remove existing payment methods', e);
        }

        const customer = await updateExistingStripeCustomer(customerId, registrationDetails, stripe);

        if (!customer.id) {
            throw new Error('Failed to update Stripe customer');
        }

        const invoiceObject = await getStripeInvoiceById(registrationDetails.stripeInvoiceId, stripe);

        if (!invoiceObject.id) {
            throw new Error('Invoice does not exist');
        }

        let paymentIntent = invoiceObject.payment_intent;

        if (invoiceObject.status === 'draft') {
            const invoiceFinalize = await finalizeInvoiceStripe(registrationDetails.stripeInvoiceId, stripe);

            if (!invoiceFinalize.payment_intent) {
                throw new Error('Failed to finalize Stripe invoice');
            }
            paymentIntent = invoiceFinalize.payment_intent;
        }

        console.info('Adding payment method');
        const updatedPaymentIntent = await paymentIntentUpdateStripe(paymentIntent as string, stripe);

        if (!updatedPaymentIntent?.client_secret) {
            throw new Error('Failed to update payment intent');
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const metadata: Stripe.Metadata = customer.metadata;
        if (registrationDetails.hasPurchaseOrderNumber) {
            const { id: stripeCustomerId } = await updatePurchaseOrderNumber(
                registrationDetails,
                registrationDetails.stripeInvoiceId,
                metadata?.purchase_order_number,
                customer.id,
                stripe,
            );

            if (!stripeCustomerId) {
                throw new Error('Failed to update Stripe customer metadata');
            }
        }

        return { clientSecret: updatedPaymentIntent.client_secret };
    }

    @Mutation(() => PayingCustomer)
    async createMotoPaymentCustomer(
        @Ctx('stripe') stripe: IContext['stripe'],
        @Arg('registrationDetails', () => RegistrationDetails) registrationDetails: IRegistrationDetails,
    ): Promise<PayingCustomer> {
        registerLogger.info('start');

        const { id: stripeCustomerId } = await getOrCreateStripeCustomer(registrationDetails, stripe);

        if (!stripeCustomerId) {
            throw new Error('Failed to create Stripe customer');
        }
        return { stripeCustomerId };
    }

    @Mutation(() => Boolean)
    async makeMotoPayment(
        @Ctx('stripe') stripe: IContext['stripe'],
        @Ctx('environment') environment: IContext['environment'],
        @Arg('paymentMethodId', () => String) paymentMethodId: string,
        @Arg('customerId', () => String) customerId: string,
        @Arg('registrationDetails', () => RegistrationDetails) registrationDetails: IRegistrationDetails,
    ): Promise<boolean> {
        const setupIntent = await createMotoStripeSetupIntent(paymentMethodId, customerId, stripe);
        if (!setupIntent.id) {
            throw new Error('Failed to create Stripe setup intent');
        }

        const customer = await addPaymentMethodToCustomer(paymentMethodId, customerId, stripe);

        if (!customer.id) {
            throw new Error('Failed to add payment method to Stripe customer');
        }

        const { id: stripePriceId } = await calculateAmounts(registrationDetails.numberOfEmployees, stripe);
        const { ENVIRONMENT_NAME } = environment;
        const invoice = await createStripeInvoice(stripePriceId, customerId, ENVIRONMENT_NAME, stripe);

        if (!invoice?.id) {
            throw new Error('Failed to create a Stripe invoice');
        }

        if (registrationDetails.hasPurchaseOrderNumber) {
            const { id: stripeCustomerId } = await updatePurchaseOrderNumber(
                registrationDetails,
                invoice.id,
                customer.metadata.purchase_order_number,
                customer.id,
                stripe,
            );

            if (!stripeCustomerId) {
                throw new Error('Failed to update Stripe customer metadata');
            }
        }

        const invoiceExisting = await payExistingInvoiceStripe(invoice.id);
        if (!invoiceExisting?.id) {
            throw new Error('Failed to pay Existing invoice');
        }

        return true;
    }

    @Mutation(() => PayingCustomer)
    async updateExistingMotoPaymentCustomer(
        @Ctx('stripe') stripe: IContext['stripe'],
        @Arg('customerId', () => String) customerId: string,
        @Arg('registrationDetails', () => RegistrationDetails) registrationDetails: IRegistrationDetails,
    ): Promise<PayingCustomer> {
        registerLogger.info('start');
        const { id: stripeCustomerId } = await updateExistingStripeCustomer(customerId, registrationDetails, stripe);
        if (!stripeCustomerId) {
            throw new Error('Failed to update Stripe customer');
        }
        return { stripeCustomerId };
    }

    @Mutation(() => Boolean)
    async payExistingMotoInvoice(
        @Ctx('stripe') stripe: IContext['stripe'],
        @Ctx('environment') environment: IContext['environment'],
        @Arg('paymentMethodId', () => String) paymentMethodId: string,
        @Arg('customerId', () => String) customerId: string,
        @Arg('registrationDetails', () => RegistrationDetails) registrationDetails: IRegistrationDetails,
    ): Promise<boolean> {
        const setupIntent = await createMotoStripeSetupIntent(paymentMethodId, customerId, stripe);
        if (!setupIntent.id) {
            throw new Error('Failed to create Stripe setup intent');
        }

        const customer = await addPaymentMethodToCustomer(paymentMethodId, customerId, stripe);

        if (!customer.id) {
            throw new Error('Failed to add payment method to Stripe customer');
        }

        const invoice = await payExistingInvoiceStripe(registrationDetails.stripeInvoiceId);
        if (!invoice?.id) {
            throw new Error('Failed to pay Existing invoice');
        }

        if (registrationDetails.hasPurchaseOrderNumber) {
            const { id: stripeCustomerId } = await updatePurchaseOrderNumber(
                registrationDetails,
                registrationDetails.stripeInvoiceId,
                customer.metadata.purchase_order_number,
                customer.id,
                stripe,
            );

            if (!stripeCustomerId) {
                throw new Error('Failed to update Stripe customer metadata');
            }
        }

        return true;
    }
}
