export interface Payment {
    id: number;
    paymentUid: number;
    status: 'PAID' | 'CANCELED';
    price: number;
}

export type PaymentId = number;

export interface PaymentFilter {
    // TODO: что тут должно быть?
}
