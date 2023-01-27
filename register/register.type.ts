import { ObjectType, Field, InputType, Int } from 'type-graphql';

export interface IBacsPaymentMetaData {
    initialSubscriptionIsBacsPayment?: 'true' | 'false';
    initialSubscriptionPriceId?: string;
}

export interface IRegistrationDetails {
    numberOfEmployees: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    companyName: string;
    companyAddressLine1: string;
    companyAddressLine2: string;
    companyTownCity: string;
    companyCounty: string;
    companyPostcode: string;
    isDifferentAddress: boolean;
    billingName?: string;
    billingAddressLine1?: string;
    billingAddressLine2?: string;
    billingTownCity?: string;
    billingCounty?: string;
    billingPostcode?: string;
    hasOptedForEmailContact: boolean;
    hasOptedForPhoneContact: boolean;
    hasOptedForTextContact: boolean;
    hasOptedForPostContact: boolean;
    hasAcceptedTerms: boolean;
    referralCode?: string;
    paymentMethodId?: string;
    bacs: boolean;
    originPortal: string;
    hasPurchaseOrderNumber: boolean;
    purchaseOrderNumber?: string;
    stripeCustomerId?: string;
    stripeInvoiceId?: string;
    stripeInvoicePaid?: string;
    stripeInvoiceStatus?: string;
    stripeInvoiceSubtotal?: number;
    stripeInvoiceTax?: number;
    stripeInvoiceTotal?: number;
}

@InputType()
export class RegistrationDetails implements IRegistrationDetails {
    @Field(() => Int)
    numberOfEmployees!: number;

    @Field(() => String)
    firstName!: string;

    @Field(() => String)
    lastName!: string;

    @Field(() => String)
    email!: string;

    @Field(() => String)
    mobileNumber!: string;

    @Field(() => String)
    companyName!: string;

    @Field(() => String)
    companyAddressLine1!: string;

    @Field(() => String)
    companyAddressLine2!: string;

    @Field(() => String)
    companyTownCity!: string;

    @Field(() => String)
    companyCounty!: string;

    @Field(() => String)
    companyPostcode!: string;

    @Field(() => Boolean)
    isDifferentAddress!: boolean;

    @Field(() => String, { nullable: true })
    billingName?: string;

    @Field(() => String, { nullable: true })
    billingAddressLine1?: string;

    @Field(() => String, { nullable: true })
    billingAddressLine2?: string;

    @Field(() => String, { nullable: true })
    billingTownCity?: string;

    @Field(() => String, { nullable: true })
    billingCounty?: string;

    @Field(() => String, { nullable: true })
    billingPostcode?: string;

    @Field(() => Boolean)
    hasOptedForEmailContact!: boolean;

    @Field(() => Boolean)
    hasOptedForPhoneContact!: boolean;

    @Field(() => Boolean)
    hasOptedForTextContact!: boolean;

    @Field(() => Boolean)
    hasOptedForPostContact!: boolean;

    @Field(() => Boolean)
    hasAcceptedTerms!: boolean;

    @Field(() => String, { nullable: true })
    referralCode: string | undefined = undefined;

    @Field(() => Boolean)
    bacs!: boolean;

    @Field(() => String)
    originPortal!: string;

    @Field(() => Boolean)
    hasPurchaseOrderNumber!: boolean;

    @Field(() => String, { nullable: true })
    purchaseOrderNumber?: string;

    @Field(() => String, { nullable: true })
    paymentMethodId?: string;

    @Field(() => String, { nullable: true })
    stripeCustomerId?: string;

    @Field(() => String, { nullable: true })
    stripeInvoiceId?: string;

    @Field(() => String, { nullable: true })
    stripeInvoicePaid?: string;

    @Field(() => String, { nullable: true })
    stripeInvoiceStatus?: string;

    @Field(() => Int, { nullable: true })
    stripeInvoiceSubtotal?: number;

    @Field(() => Int, { nullable: true })
    stripeInvoiceTax?: number;

    @Field(() => Int, { nullable: true })
    stripeInvoiceTotal?: number;
}

@ObjectType()
export class PayingCustomer {
    @Field(() => String)
    stripeCustomerId!: string;
}

@ObjectType()
export class PaymentIntentForExistingCustomer {
    @Field(() => String)
    clientSecret!: string;
}

@ObjectType()
export class PaymentIntent {
    @Field(() => String)
    clientSecret!: string;

    @Field(() => String)
    stripeCustomerId!: string;
}

@ObjectType()
export class BacsCustomer {
    @Field(() => String)
    stripeCustomerId!: string;

    @Field(() => String)
    invoiceId!: string;
}
