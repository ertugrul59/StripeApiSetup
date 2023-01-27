import useStripePayment from './use-stripe-payment';
import { customerSetupMutation } from './index.query';
import { render, act } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';

const mockElement = () => ({
    mount: jest.fn(),
    destroy: jest.fn(),
    on: jest.fn(),
    update: jest.fn(),
});

const mockElements = {
    getElement: () => {
        return 'stripe-element';
    },
};

let mockConfirmCardPayment = jest.fn();
let mockCreatePaymentMethod = jest.fn();

const mockStripe = {
    elements: jest.fn(() => mockElements),
    createToken: jest.fn(),
    createSource: jest.fn(),
    createPaymentMethod: mockCreatePaymentMethod,
    confirmCardPayment: mockConfirmCardPayment,
    paymentRequest: jest.fn(),
    _registerWrapper: jest.fn(),
};

jest.mock('@stripe/react-stripe-js', () => {
    const stripe = jest.requireActual('@stripe/react-stripe-js');
    return {
        ...stripe,
        Element: () => {
            return mockElement;
        },
        useStripe: () => {
            return mockStripe;
        },
        useElements: () => {
            return mockElements;
        },
    };
});

let address: any;
let variables: any;
let mocks: any;

beforeEach(() => {
    address = {
        numberOfEmployees: 10,
        firstName: 'first-name',
        lastName: 'last-name',
        name: 'gmail',
        email: 'ertu@gmail.com',
        mobileNumber: '07973232323',
        companyName: 'ACME',
        companyAddressLine1: 'Company Acme drive',
        companyAddressLine2: '',
        companyTownCity: 'Gotham',
        companyCounty: 'Company',
        companyPostcode: 'CF14 2DC',
        isDifferentAddress: false,
        billingName: 'frodo@gmail.com',
        billingAddressLine1: 'crestview',
        billingAddressLine2: '',
        billingTownCity: 'birmingham',
        billingCounty: 'Billing',
        billingPostcode: 'CF22 2JC',
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

    variables = {
        registrationDetails: {
            ...address,
            originPortal: 'public',
        },
    };

    mocks = [
        {
            request: {
                query: customerSetupMutation,
                variables,
            },
            result: {
                data: {
                    createPaymentCustomer: {
                        stripeCustomerId: 'secret',
                        clientSecret: 'cs_secret',
                    },
                },
            },
        },
        {
            request: {
                query: customerSetupMutation,
                variables: {
                    registrationDetails: {
                        ...address,
                        isDifferentAddress: true,
                        originPortal: 'public',
                    },
                },
            },
            result: {
                data: {
                    createPaymentCustomer: {
                        stripeCustomerId: 'secret',
                        clientSecret: 'cs_secret',
                    },
                },
            },
        },
    ];
});

type ReturnValue = {
    startPayment: Function;
};
function setup(): ReturnValue {
    const returnVal = {};
    function TestComponent() {
        Object.assign(returnVal, useStripePayment());
        return null;
    }
    render(
        <MockedProvider mocks={mocks} addTypename={false}>
            <TestComponent />
        </MockedProvider>,
    );
    return returnVal as ReturnValue;
}

test('uses company address if the billing address is the same', async () => {
    const component = setup();
    mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: { id: 'si_123', payment_method: 'pm_123' },
        error: null,
    });

    await act(async () => await component.startPayment(address));

    expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith('cs_secret', {
        payment_method: {
            card: 'stripe-element',
            billing_details: {
                name: 'ACME',
                email: 'ertu@gmail.com',
                phone: '07973232323',
                address: {
                    line1: 'Company Acme drive',
                    line2: '',
                    city: 'Gotham',
                    state: 'Company',
                    postal_code: 'CF14 2DC',
                },
            },
        },
    });
});

test('uses billing address if the billing address is different from the company address', async () => {
    const component = setup();
    mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: { id: 'si_123', payment_method: 'pm_123' },
        error: null,
    });

    try {
        await act(async () => await component.startPayment({ ...address, isDifferentAddress: true }));
    } catch (err) {
        console.log('Error: ', err);
    }

    expect(mockStripe.confirmCardPayment).toHaveBeenCalledWith('cs_secret', {
        payment_method: {
            card: 'stripe-element',
            billing_details: {
                name: 'ACME',
                email: 'ertu@gmail.com',
                phone: '07973232323',
                address: {
                    line1: 'crestview',
                    line2: '',
                    city: 'birmingham',
                    state: 'Billing',
                    postal_code: 'CF22 2JC',
                },
            },
        },
    });
});

test('throws error if a payment customer could not be created', async () => {
    const component = setup();
    mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: { id: null, payment_method: null },
        error: { message: null },
    });
    mocks[0].result.data.createPaymentCustomer.stripeCustomerId = '';

    let error: any;
    try {
        await act(async () => await component.startPayment(address));
    } catch (err) {
        error = err;
    }
    expect(error.message).toBe('Could not create Stripe payment intent');
});

test('throws error if an error if the payment intent method was not created', async () => {
    const component = setup();
    mockStripe.confirmCardPayment.mockResolvedValue({
        paymentIntent: null,
        error: { message: null },
    });
    mockCreatePaymentMethod.mockResolvedValue({ error: { message: null } });

    let error: any;
    try {
        await act(async () => await component.startPayment(address));
    } catch (err) {
        error = err;
    }
    expect(error.message).toBe('Could not create Stripe payment intent');
});
