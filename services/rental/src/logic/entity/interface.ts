export interface Rental {
    id?: number;
    rentalUid?: string;
    username: string;
    paymentUid: string;
    carUid: string;
    dateFrom: Date;
    dateTo: Date;
    status: 'IN_PROGRESS' | 'FINISHED' | 'CANCELED';
}

export type RentalId = string;

export interface RentalFilter {
    username: string;
}
