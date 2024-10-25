import { Car, CarFilter, CarId, EntityLogic, Payment, PaymentFilter, PaymentId } from "@rsoi-lab2/library";

import { 
    RentrievedRentalFull,
    RetrievedRental, 
    RetrievedRentalWithCar, 
    RetrievedRentalWithOptionalEntitiesAndUids,
    RetrievedRentalWithPayment,
    RetrievedRentalWithUids
} from "./interface";

export class RentalDereferenceUidsLogic {
    constructor(
        carsLogic: EntityLogic<Car, CarFilter, CarId>,
        paymentLogic: EntityLogic<Payment, PaymentFilter, PaymentId>
    ) {
        this.carsLogic = carsLogic;
        this.paymentLogic = paymentLogic;
    }

    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithUids): Promise<
        RetrievedRentalWithUids | RetrievedRentalWithCar
    >
    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithPayment): Promise<
        RetrievedRentalWithPayment | RentrievedRentalFull
    >
    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithUids | RetrievedRentalWithPayment): 
        Promise<RetrievedRental>
    async tryDereferenceRentalCarUid(rental: RetrievedRentalWithUids | RetrievedRentalWithPayment): 
        Promise<RetrievedRental> {
        const rentalCopy: RetrievedRentalWithOptionalEntitiesAndUids = {...rental};
        
        try {
            const car = await this.carsLogic.getOne(rental.carUid);

            if (car != null) {
                delete rentalCopy.carUid;

                return <RetrievedRental>{...rentalCopy, car}
            }
        } catch (err) {
            console.warn('Cars service failed');
            console.warn(err);
        }

        return rental;
    }

    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithUids): Promise<
        RetrievedRentalWithUids | RetrievedRentalWithPayment
    >
    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithCar): Promise<
        RetrievedRentalWithCar | RentrievedRentalFull
    >
    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithUids | RetrievedRentalWithCar): 
        Promise<RetrievedRental>
    async tryDereferenceRentalPaymentUid(rental: RetrievedRentalWithUids | RetrievedRentalWithCar): 
        Promise<RetrievedRental> {
        const rentalCopy: RetrievedRentalWithOptionalEntitiesAndUids = {...rental};
        
        try {
            const payment = await this.paymentLogic.getOne(rental.paymentUid);

            if (payment != null) {
                delete rentalCopy.paymentUid;

                return <RetrievedRental>{...rentalCopy, payment}
            }
        } catch (err) {
            console.warn('Cars service failed');
            console.warn(err);
        }

        return rental;
    }

    async tryDereferenceRentalUids(rental: RetrievedRentalWithUids): Promise<RetrievedRental> {
        const rentalWithCar = await this.tryDereferenceRentalCarUid(rental);

        return this.tryDereferenceRentalPaymentUid(rentalWithCar);
    }

    private carsLogic: EntityLogic<Car, CarFilter, CarId>;
    private paymentLogic: EntityLogic<Payment, PaymentFilter, PaymentId>;
}