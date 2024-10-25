import { Rental, Car, Payment } from '@rsoi-lab2/library';
import exp from 'constants';

export type RetrievedRentalWithUids = Required<Rental>;
export type RetrievedRentalBase = Omit<RetrievedRentalWithUids, 'carUid' | 'paymentUid'>;
export type RetrievedRentalWithCar = Omit<RetrievedRentalWithUids, 'carUid'> & {car: Required<Car>};
export type RetrievedRentalWithPayment = Omit<RetrievedRentalWithUids, 'paymentUid'> & {payment: Required<Payment>};
export type RentrievedRentalFull = Omit<RetrievedRentalWithCar & RetrievedRentalWithPayment, 'carUid' | 'paymentUid'>;

export type RetrievedRental = RetrievedRentalWithUids | 
    RetrievedRentalWithCar | 
    RetrievedRentalWithPayment | 
    RentrievedRentalFull;

export type RetrievedRentalWithOptionalEntitiesAndUids = RetrievedRentalBase & Partial<
    Pick<RetrievedRentalWithUids, 'carUid' | 'paymentUid'> & 
    Pick<RentrievedRentalFull, 'car' | 'payment'>
>;