import { Stripe } from 'stripe';
import { IRegistrationDetails } from '../register';
import { createStripeInvoice, getOrCreateStripeCustomer } from './stripe-service';

const EXISTING_REFERRAL_CODE = 'ABCDE';
const getMockStripe = (): Stripe => ({
    // @ts-expect-error partial mock for testing
    prices: {
        list: jest.fn().mockResolvedValue({
            data: [
                {
                    id: 'price_1LL7IkCYyIPWwVWInZ8HfeyS',
                    object: 'price',
                    active: true,
                    billing_scheme: 'per_unit',
                    created: 1657725394,
                    currency: 'gbp',
                    custom_unit_amount: null,
                    livemode: false,
                    lookup_key: null,
                    metadata: {},
                    nickname: null,
                    product: 'prod_M3DaH1PfESPofN',
                    recurring: null,
                    tax_behavior: 'unspecified',
                    tiers_mode: null,
                    transform_quantity: null,
                    type: 'one_time',
                    unit_amount: 26900,
                    unit_amount_decimal: '26900',
                },
            ],
        }),
    },
    // @ts-expect-error partial mock for testing
    subscriptions: {
        create: jest.fn().mockResolvedValue({ latest_invoice: '1234' }),
    },
    // @ts-expect-error partial mock for testing
    invoices: {
        create: jest.fn(),
    },
    // @ts-expect-error partial mock for testing
    invoiceItems: {
        create: jest.fn().mockResolvedValue({ id: 'new-customer' }),
    },
    // @ts-expect-error partial mock for testing
    customers: {
        search: jest.fn().mockImplementation((referralCode) => {
            return referralCode.query === `metadata["referral_code"]:"${EXISTING_REFERRAL_CODE}"`
                ? { data: [{ id: 'existing-customer' }] }
                : undefined;
        }),
        create: jest.fn().mockResolvedValue({ id: 'new-customer' }),
    },
});

const getMockCustomer = (): Partial<IRegistrationDetails> => ({
    mobileNumber: '07973121212',
    companyAddressLine1: 'Line1',
    companyCounty: 'County',
    companyName: 'Test',
    companyPostcode: 'T35T',
    companyTownCity: 'City',
    numberOfEmployees: 10,
});

describe('stripe-service', () => {
    describe('createStripeInvoice', () => {
        it('create invoice for customer', async () => {
            const mockStripe = getMockStripe();
            await createStripeInvoice('1', '2', 'test', mockStripe);

            expect(mockStripe.invoiceItems.create).toHaveBeenCalled();
            expect(mockStripe.invoices.create).toHaveBeenCalled();
        });
    });

    describe('getOrCreateStripeCustomer', () => {
        it('should return an existing customer if the referral code matches', async () => {
            const mockStripe = getMockStripe();
            const mockExistingCustomer = getMockCustomer();

            const customer = await getOrCreateStripeCustomer(
                { ...mockExistingCustomer, referralCode: EXISTING_REFERRAL_CODE } as IRegistrationDetails,
                mockStripe,
            );

            expect(customer).toEqual({ id: 'existing-customer' });
            expect(mockStripe.customers.search).toHaveBeenCalled();
            expect(mockStripe.customers.create).not.toHaveBeenCalled();
        });

        it('should return a new customer if the referral code has no match', async () => {
            const mockStripe = getMockStripe();
            const mockCustomer = getMockCustomer();

            const customer = await getOrCreateStripeCustomer(mockCustomer as IRegistrationDetails, mockStripe);

            expect(customer).toEqual({ id: 'new-customer' });
            expect(mockStripe.customers.search).toHaveBeenCalled();
            expect(mockStripe.customers.create).toHaveBeenCalled();
        });
    });
});
