import { Rental, Car, Payment, RentalFilter } from '@rsoi-lab2/library';

export type RetrievedRentalWithUids = Required<Rental>;
export type RetrievedRentalBase = Omit<RetrievedRentalWithUids, 'carUid' | 'paymentUid'>;
export type RetrievedRentalWithCar = Omit<RetrievedRentalWithUids, 'carUid'> & {car: Partial<Car>};
export type RetrievedRentalWithPayment = Omit<RetrievedRentalWithUids, 'paymentUid'> & {payment: Partial<Payment>};
export type RentrievedRentalFull = Omit<RetrievedRentalWithCar & RetrievedRentalWithPayment, 'carUid' | 'paymentUid'>;

export type RetrievedRental = RetrievedRentalWithUids | 
    RetrievedRentalWithCar | 
    RetrievedRentalWithPayment | 
    RentrievedRentalFull;

export type RetrievedRentalWithOptionalEntitiesAndUids = RetrievedRentalBase & Partial<
    Pick<RetrievedRentalWithUids, 'carUid' | 'paymentUid'> & 
    Pick<RentrievedRentalFull, 'car' | 'payment'>
>;

export interface RentalRetrieveSingleRequest {
    rentalUid: Exclude<Rental['rentalUid'], undefined>;
}

export interface RentalRetrieveSingleResponse {
    rental: RetrievedRental | null;
}

export interface RentalRetrieveAllRequest {}

export interface RentalRetrieveAllResponse {
    rentals: RetrievedRental[];
}
