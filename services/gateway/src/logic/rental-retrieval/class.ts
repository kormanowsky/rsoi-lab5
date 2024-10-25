import { Car, CarFilter, CarId, EntityLogic, Payment, PaymentFilter, PaymentId, Rental, RentalFilter, RentalId } from "@rsoi-lab2/library";

import { 
    RetrievedRental, 
    RetrievedRentalWithOptionalEntitiesAndUids
} from "./interface";

export class RentalRetrievalLogic {
    constructor(
        carsLogic: EntityLogic<Car, CarFilter, CarId>,
        paymentLogic: EntityLogic<Payment, PaymentFilter, PaymentId>,
        rentalLogic: EntityLogic<Rental, RentalFilter, RentalId>
    ) {
        this.carsLogic = carsLogic;
        this.rentalLogic = rentalLogic;
        this.paymentLogic = paymentLogic;
    }

    async retrieveRental(id: RentalId, rentalFilter: RentalFilter): Promise<RetrievedRental | null> {
        const rawRental = await this.rentalLogic.getOne(id);

        if (rawRental == null || rawRental.username !== rentalFilter.username) {
            return null;
        }

        return this.tryDereferenceRentalUids(rawRental);
    }

    async retrieveRentals(rentalFilter: RentalFilter): Promise<RetrievedRental[]> {
        const rawRentals = await this.rentalLogic.getMany(rentalFilter);

        return Promise.all(
            rawRentals.map((rental) => this.tryDereferenceRentalUids(rental))
        );
    }

    protected async tryDereferenceRentalUids(rental: Required<Rental>): Promise<RetrievedRental> {
        const rentalCopy: RetrievedRentalWithOptionalEntitiesAndUids = {...rental};
        
        let resultRental: RetrievedRental = {...rental};

        try {
            const payment = await this.paymentLogic.getOne(rental.paymentUid);

            if (payment != null) {
                delete rentalCopy.paymentUid;
                rentalCopy.payment = payment;

                resultRental = <RetrievedRental>{...rentalCopy};
            }
        } catch (err) {
            console.warn('Payment service failed');
            console.warn(err);
        }

        try {
            const car = await this.carsLogic.getOne(rental.carUid);

            if (car != null) {
                delete rentalCopy.carUid;
                rentalCopy.car = car;

                resultRental = <RetrievedRental>{...rentalCopy};
            }
        } catch (err) {
            console.warn('Cars service failed');
            console.warn(err);
        }

        return resultRental;
    }

    private carsLogic: EntityLogic<Car, CarFilter, CarId>;
    private rentalLogic: EntityLogic<Rental, RentalFilter, RentalId>;
    private paymentLogic: EntityLogic<Payment, PaymentFilter, PaymentId>;
}
