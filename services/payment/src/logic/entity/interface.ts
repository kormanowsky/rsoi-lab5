export interface Payment {
    id: number;
    paymentUid: string;
    status: 'PAID' | 'CANCELED';
    price: number;
}

export type PaymentId = string;

export interface PaymentFilter {
    // TODO: что тут должно быть?
}
