export interface Payment {
    id?: number;
    paymentUid?: string;
    status: 'PAID' | 'CANCELED';
    price: number;
}

export type PaymentId = string;

// Намеренно пустой интерфейс
export interface PaymentFilter {}
