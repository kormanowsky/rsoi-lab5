import { Car, CarFilter, CarId, EntityLogic, Payment, PaymentFilter, PaymentId } from '@rsoi-lab2/library';

import {
    ConfigurableLogic,
    LogicOptions
} from '../interface';

import { 
    RentrievedRentalFull,
    RetrievedRental, 
    RetrievedRentalWithCar, 
    RetrievedRentalWithOptionalEntitiesAndUids,
    RetrievedRentalWithPayment,
    RetrievedRentalWithUids
} from './interface';

export class RentalDereferenceUidsLogic implements ConfigurableLogic<RentalDereferenceUidsLogic> {
    constructor(
        carsLogic: ConfigurableLogic<EntityLogic<Car, CarFilter, CarId>>,
        paymentLogic: EntityLogic<Payment, PaymentFilter, PaymentId>
    ) {
        this.carsLogic = carsLogic;
        this.paymentLogic = paymentLogic;
    }

    withOptions(options: LogicOptions): ConfigurableLogic<RentalDereferenceUidsLogic> {
        return new RentalDereferenceUidsLogic(
            this.carsLogic.withOptions(options),
            this.paymentLogic  
        );
    }

    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithUids): 
        Promise<RetrievedRentalWithUids | RetrievedRentalWithCar>
    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithPayment): 
        Promise<RetrievedRentalWithPayment | RentrievedRentalFull>
    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithUids | RetrievedRentalWithPayment): 
        Promise<RetrievedRental>
    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithUids, car: Required<Car>): 
        Promise<RetrievedRentalWithCar>
    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithPayment, car: Required<Car>): 
        Promise<RentrievedRentalFull>
    async tryDereferenceRentalCarUid(
        rental: RetrievedRentalWithUids | RetrievedRentalWithPayment, car: Required<Car>
    ): Promise<RetrievedRental>
    async tryDereferenceRentalCarUid(
        rental: RetrievedRentalWithUids | RetrievedRentalWithPayment, 
        car: Required<Car> | null = null
    ): Promise<RetrievedRental> {
        const rentalCopy: RetrievedRentalWithOptionalEntitiesAndUids = {...rental};

        delete rentalCopy.carUid;
        
        try {
            if (car == null) {
                car = await this.carsLogic.getOne(rental.carUid);
            }

            if (car != null) {
                return <RetrievedRental>{...rentalCopy, car}
            }
        } catch (err) {
            console.warn('Cars service failed');
            console.warn(err);
        }

        return <RetrievedRental>{...rentalCopy, car: {}};
    }

    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithUids): 
        Promise<RetrievedRentalWithUids | RetrievedRentalWithPayment>
    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithCar): 
        Promise<RetrievedRentalWithCar | RentrievedRentalFull>
    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithUids | RetrievedRentalWithCar): 
        Promise<RetrievedRental>
    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithUids, payment: Required<Payment>): 
        Promise<RetrievedRentalWithPayment>
    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithCar, payment: Required<Payment>): 
        Promise<RentrievedRentalFull>
    async tryDereferenceRentalPaymentUid(
        rental: RetrievedRentalWithUids | RetrievedRentalWithCar, payment: Required<Payment>
    ): 
        Promise<RetrievedRental>
    async tryDereferenceRentalPaymentUid(
        rental: RetrievedRentalWithUids | RetrievedRentalWithCar, 
        payment: Required<Payment> | null = null
    ): Promise<RetrievedRental> {
        const rentalCopy: RetrievedRentalWithOptionalEntitiesAndUids = {...rental};

        delete rentalCopy.paymentUid;
        
        try {
            if (payment == null) {
                payment = await this.paymentLogic.getOne(rental.paymentUid);
            }

            if (payment != null) {
                return <RetrievedRental>{...rentalCopy, payment}
            }
        } catch (err) {
            console.warn('Payment service failed');
            console.warn(err);
        }

        return <RetrievedRental>{...rentalCopy, payment: {}};
    }

    async tryDereferenceRentalUids(rental: RetrievedRentalWithUids): Promise<RetrievedRental> {
        const rentalWithCar = await this.tryDereferenceRentalCarUid(rental);

        return this.tryDereferenceRentalPaymentUid(rentalWithCar);
    }

    private carsLogic: ConfigurableLogic<EntityLogic<Car, CarFilter, CarId>>;
    private paymentLogic: EntityLogic<Payment, PaymentFilter, PaymentId>;
}