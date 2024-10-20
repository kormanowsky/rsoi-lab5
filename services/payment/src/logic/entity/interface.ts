export interface Payment {
    id: number;
    paymentUid: string;
    status: 'PAID' | 'CANCELED';
    price: number;
}

export type PaymentId = number;

export interface PaymentFilter {
    // TODO: что тут должно быть?
}
