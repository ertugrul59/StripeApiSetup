import { useMutation } from '@apollo/client';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { IRegistrationDetails, mapBillingDetails } from '../mapBillingDetails';
import { customerSetupMutation, updateExistingCustomerMutation } from './index.query';
import {
    StripePaymentHook,
    CreatePaymentCustomerArgs,
    CreatePaymentCustomerResponse,
    UpdateExistingCustomerArgs,
    UpdateExistingCustomerResponse,
} from './index.types';
import config from '../../../config';

const useStripePayment = (): StripePaymentHook => {
    const stripe = useStripe();
    const elements = useElements();

    const [createPaymentCustomer] = useMutation<CreatePaymentCustomerResponse, CreatePaymentCustomerArgs>(
        customerSetupMutation,
    );

    const [updateExistingCustomer] = useMutation<UpdateExistingCustomerResponse, UpdateExistingCustomerArgs>(
        updateExistingCustomerMutation,
    );

    const payNew = async (registrationDetails: IRegistrationDetails, cardElement: any, stripe: any) => {
        console.log('create payment customer');
        const { data } = await createPaymentCustomer({
            variables: {
                registrationDetails: { ...registrationDetails, originPortal: config.originPortal },
            },
        });

        const clientSecret = data?.createPaymentCustomer?.clientSecret;

        if (!clientSecret) {
            throw new Error('Could not create payment customer');
        }

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: mapBillingDetails(registrationDetails),
            },
        });

        if (error || !paymentIntent?.id || !paymentIntent.payment_method) {
            throw new Error('Could not create Stripe payment intent');
        }
    };

    const payExisting = async (registrationDetails: IRegistrationDetails, cardElement: any, stripe: any) => {
        console.log('create payment intent for existing customer');
        const { data } = await updateExistingCustomer({
            variables: {
                customerId: registrationDetails.stripeCustomerId,
                registrationDetails: { ...registrationDetails, originPortal: config.originPortal },
            },
        });

        const clientSecret = data?.updateExistingCustomer?.clientSecret;

        if (!clientSecret) {
            throw new Error('Could not set up payment intent');
        }

        const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: mapBillingDetails(registrationDetails),
            },
        });

        if (error || !paymentIntent?.id || !paymentIntent.payment_method) {
            throw new Error('Could not create Stripe payment intent');
        }
    };

    const startPayment = async (registrationDetails: IRegistrationDetails) => {
        if (!stripe) throw new Error('"stripe" missing');
        if (!elements) throw new Error('"elements" missing');
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('"CardElement" missing');

        if (registrationDetails.stripeCustomerId) {
            await payExisting(registrationDetails, cardElement, stripe);
        } else {
            await payNew(registrationDetails, cardElement, stripe);
        }
    };

    return { startPayment };
};

export default useStripePayment;
