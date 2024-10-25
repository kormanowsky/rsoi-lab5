import { RentalProcessCancelRequest, RentalProcessCancelResponse, RentalProcessFinishRequest, RentalProcessFinishResponse, RentalProcessStartRequest, RentalProcessStartResponse } from "./interface";
import { Car, CarFilter, CarId, EntityLogic, Payment, PaymentFilter, PaymentId, Rental, RentalFilter, RentalId } from "@rsoi-lab2/library";
import { RentalDereferenceUidsLogic, RetrievedRental, RetrievedRentalWithOptionalEntitiesAndUids, RetrievedRentalWithPayment } from "../rental-retrieval";

export class RentalProcessLogic {
    constructor(
        carsLogic: EntityLogic<Car, CarFilter, CarId>,
        paymentsLogic: EntityLogic<Payment, PaymentFilter, PaymentId>,
        rentalsLogic: EntityLogic<Rental, RentalFilter, RentalId>,
        rentalDereferenceLogic: RentalDereferenceUidsLogic
    ) {
        this.carsLogic = carsLogic;
        this.paymentsLogic = paymentsLogic;
        this.rentalsLogic = rentalsLogic;
        this.rentalDereferenceLogic = rentalDereferenceLogic;
    }

    async startRental(request: RentalProcessStartRequest): Promise<RentalProcessStartResponse> {
        const rentalDays = (request.dateTo!.getTime() - request.dateFrom!.getTime()) / (1000 * 3600 * 24);

        if (rentalDays <= 0) {
            return {error: true, code: 400, message: 'Rental may not finish before start'};
        }

        let car: Car | null;

        try {
            car = await this.carsLogic.getOne(request.carUid);

        } catch(err) {
            console.error(err);
            return {error: true, code: 500, message: 'Cars service failure'};
        }

        if (car == null) {
            return {error: true, code: 400, message: 'Bad car id'};
        }

        if (!car.available) {
            return {error: true, code: 403, message: 'Car is not available'};
        }

        const price = car.price * rentalDays;

        let payment: Required<Payment>;

        try {
            payment = await this.paymentsLogic.create({
                status: 'PAID',
                price
            });
        } catch (err) {
            console.error(err);
            return {error: true, code: 500, message: 'Payment service failure'};
        }

        let rental: Required<Rental>;

        try {
            rental = await this.rentalsLogic.create({
                ...request,
                paymentUid: payment.paymentUid,
                status: 'IN_PROGRESS'
            });
        } catch (err) {
            console.error(err);

            try {
                await this.paymentsLogic.update(payment.paymentUid, {status: 'CANCELED'});
            } catch (err) {
                console.error(err);
            }

            return {error: true, code: 500, message: 'Payment service failure'};
        }

        try {
            await this.carsLogic.update(car.carUid, {available: false});
        } catch (err) {
            console.error(err);

            try {
                await this.rentalsLogic.update(rental.rentalUid, {status: 'CANCELED'});
            } catch (err) {
                console.error(err);
            }

            try {
                await this.paymentsLogic.update(payment.paymentUid, {status: 'CANCELED'});
            } catch (err) {
                console.error(err);
            }

            return {error: true, code: 500, message: 'Cars service failure'};
        }

        return {
            error: false,
            rental: await this.rentalDereferenceLogic.tryDereferenceRentalPaymentUid(rental, payment)
        }
    }

    async cancelRental(request: RentalProcessCancelRequest): Promise<RentalProcessCancelResponse> {
        let rental: Required<Rental> | null;

        try {
            rental = await this.rentalsLogic.getOne(request.rentalUid);
        } catch (err) {
            console.log(err);
            return {error: true, code: 500, message: 'Rental service failure'};
        }

        if (rental == null || rental.username !== request.username) {
            return {error: true, code: 404, message: 'No such rental'};
        }

        try {
            await this.carsLogic.update(rental.carUid, {available: true});
            await this.rentalsLogic.update(rental.rentalUid, {status: 'CANCELED'});
            await this.paymentsLogic.update(rental.paymentUid, {status: 'CANCELED'});

        } catch (err) {
            console.log(err);
            return {error: true, code: 500, message: 'Transaction failure'};
        }

        return {error: false};
    }

    async finishRental(request: RentalProcessFinishRequest): Promise<RentalProcessFinishResponse> {
        let rental: Required<Rental> | null;

        try {
            rental = await this.rentalsLogic.getOne(request.rentalUid);
        } catch (err) {
            console.log(err);
            return {error: true, code: 500, message: 'Rental service failure'};
        }

        if (rental == null || rental.username !== request.username) {
            return {error: true, code: 404, message: 'No such rental'};
        }

        try {
            await this.carsLogic.update(rental.carUid, {available: true});
            await this.rentalsLogic.update(rental.rentalUid, {status: 'FINISHED'});

        } catch (err) {
            console.log(err);
            return {error: true, code: 500, message: 'Transaction failure'};
        }

        return {error: false};
    }

    private carsLogic: EntityLogic<Car, CarFilter, CarId>;
    private paymentsLogic: EntityLogic<Payment, PaymentFilter, PaymentId>;
    private rentalsLogic: EntityLogic<Rental, RentalFilter, RentalId>;
    private rentalDereferenceLogic: RentalDereferenceUidsLogic;
}