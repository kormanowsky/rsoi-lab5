import { Car, CarFilter, CarId, EntityLogic, Payment, PaymentFilter, PaymentId, Rental, RentalFilter, RentalId, Transaction, TransactionChain, TransactionCommitOutput } from '@rsoi-lab2/library';
import { RentalDereferenceUidsLogic } from '../rental-retrieval';
import { RentalProcessCalculateRequest, RentalProcessCalculateResponse, RentalProcessCancelRequest, RentalProcessCancelResponse, RentalProcessFinishRequest, RentalProcessFinishResponse, RentalProcessStartRequest, RentalProcessStartRequestWithPrice, RentalProcessStartResponse } from './interface';


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
        let price: number; 
        
        try {
            const response = await this.calculateRentalPrice(request);

            if (response.error !== false) {
                return response;
            }

            price = response.price;
    
        } catch (err) {
            return {error: true, code: 500, message: 'Calculation error'};
        }

        const {error, output} = await this.commitStartRental({...request, price});

        if (error != null || output == null) {
            return {error: true, code: 503, message: error.message};
        }

        const {rental, payment} = output;

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

        const {error} = await this.commitCancelRental(rental);

        if (error != null) {
            // TODO: поставить в очередь вместо 500
            // return {error: true, code: 500, message: `Transaction error: ${error}`};
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

        const {error} = await this.commitFinishRental(rental);

        if (error != null) {
            // TODO: поставить в очередь вместо 500
            // return {error: true, code: 500, message: `Transaction error: ${error}`};
        }

        return {error: false};
    }

    async calculateRentalPrice(request: RentalProcessCalculateRequest): Promise<RentalProcessCalculateResponse> {
        const rentalDays = (request.dateTo.getTime() - request.dateFrom.getTime()) / (1000 * 3600 * 24);

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

        return {error: false, price: car.price * rentalDays};
    }

    protected commitStartRental(request: RentalProcessStartRequestWithPrice): 
        Promise<TransactionCommitOutput<{payment: Required<Payment>; rental: Required<Rental>}>> {
            
        const chain = new TransactionChain<{payment?: Required<Payment>; rental?: Required<Rental>}>(
            new Transaction({
                do: async (state) => {
                    try {
                        state.payment = await this.paymentsLogic.create({status: 'PAID', price: request.price});
                        return state;
                    } catch (err) {
                        console.error(err);
                        throw new Error('Payment Service unavailable');
                    }
                }, 
                undo: async (state) => {
                    if (state.payment != null) {
                        await this.paymentsLogic.delete(state.payment.paymentUid);
                        delete state.payment;
                    }
                    return state;
                }
            }), 

            new Transaction({
                do: async (state) => {
                    try {
                        state.rental = await this.rentalsLogic.create({
                            ...request,
                            paymentUid: state.payment!.paymentUid,
                            status: 'IN_PROGRESS'
                        });

                        return state;
                    } catch (err) {
                        console.error(err);
                        throw new Error('Rental Service unavailable');
                    }
                }, 
                undo: async (state) => {
                    if (state.rental != null) {
                        await this.rentalsLogic.delete(state.rental.rentalUid);
                        delete state.rental;
                    } 
                    return state;
                }
            }), 

            new Transaction({
                do: async (_) => {
                    try {
                        await this.carsLogic.update(request.carUid, {available: false});
                        return _;
                    } catch (err) {
                        console.error(err);
                        throw new Error('Cars Service unavailable');
                    }
                }, 
                undo: async (_) => {await this.carsLogic.update(request.carUid, {available: true}); return _;}
            })
        );

        return chain.commit({}).then(
            output => <TransactionCommitOutput<{payment: Required<Payment>; rental: Required<Rental>}>>output
        );
    }

    protected commitCancelRental(rental: Required<Rental>): Promise<TransactionCommitOutput<void>> {
        const chain = new TransactionChain<void>(
            new Transaction({
                do: async () => {await this.carsLogic.update(rental.carUid, {available: true})},
                undo: async () => {await this.carsLogic.update(rental.carUid, {available: false})}
            }),
            new Transaction({
                do: async () => {await this.rentalsLogic.update(rental.rentalUid, {status: 'CANCELED'})},
                undo: async () => {
                    // TODO: сделать норм откат транзакции
                    // await this.rentalsLogic.update(rental.rentalUid, {status: 'IN_PROGRESS'})
                }
            }),
            new Transaction({
                do: async () => {await this.paymentsLogic.update(rental.paymentUid, {status: 'CANCELED'})},
                undo: async () => {await this.paymentsLogic.update(rental.paymentUid, {status: 'PAID'})}
            }),
        );

        return chain.commit();
    }

    protected commitFinishRental(rental: Required<Rental>): Promise<TransactionCommitOutput<void>> {
        const chain = new TransactionChain<void>(
            new Transaction({
                do: async () => {await this.carsLogic.update(rental.carUid, {available: true})},
                undo: async () => {await this.carsLogic.update(rental.carUid, {available: false})}
            }),
            new Transaction({
                do: async () => {await this.rentalsLogic.update(rental.rentalUid, {status: 'FINISHED'})},
                undo: async () => {
                    // TODO: сделать норм откат транзакции
                    // await this.rentalsLogic.update(rental.rentalUid, {status: 'IN_PROGRESS'})
                }
            }),
        );

        return chain.commit();
    }

    private carsLogic: EntityLogic<Car, CarFilter, CarId>;
    private paymentsLogic: EntityLogic<Payment, PaymentFilter, PaymentId>;
    private rentalsLogic: EntityLogic<Rental, RentalFilter, RentalId>;
    private rentalDereferenceLogic: RentalDereferenceUidsLogic;
}
