import { Car, CarFilter, CarId, EntityLogic, Payment, PaymentFilter, PaymentId, Rental, RentalFilter, RentalId, Transaction, TransactionChain, TransactionCommitOutput } from '@rsoi-lab2/library';
import { ConfigurableLogic, LogicOptions } from '../interface';
import { RentalDereferenceUidsLogic } from '../rental-retrieval';
import { 
    RentalProcessCalculateRequest, 
    RentalProcessCalculateResponse, 
    RentalProcessCancelRequest, 
    RentalProcessCancelResponse, 
    RentalProcessFinishRequest, 
    RentalProcessFinishResponse, 
    RentalProcessStartRequest, 
    RentalProcessStartRequestWithPrice, 
    RentalProcessStartResponse 
} from './interface';


export class RentalProcessLogic implements ConfigurableLogic<RentalProcessLogic> {
    constructor(
        carsLogic: ConfigurableLogic<EntityLogic<Car, CarFilter, CarId>>,
        paymentsLogic: ConfigurableLogic<EntityLogic<Payment, PaymentFilter, PaymentId>>,
        rentalsLogic: ConfigurableLogic<EntityLogic<Omit<Rental, 'username'>, RentalFilter, RentalId>>,
        rentalDereferenceLogic: ConfigurableLogic<RentalDereferenceUidsLogic>
    ) {
        this.carsLogic = carsLogic;
        this.paymentsLogic = paymentsLogic;
        this.rentalsLogic = rentalsLogic;
        this.rentalDereferenceLogic = rentalDereferenceLogic;
    }

    withOptions(options: LogicOptions): ConfigurableLogic<RentalProcessLogic> {
        return new RentalProcessLogic(
            this.carsLogic.withOptions(options),
            this.paymentsLogic.withOptions(options),
            this.rentalsLogic.withOptions(options),
            this.rentalDereferenceLogic.withOptions(options)
        );
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
            rental = <Required<Rental>>await this.rentalsLogic.getOne(request.rentalUid);
        } catch (err) {
            console.log(err);
            return {error: true, code: 500, message: 'Rental service failure'};
        }

        if (rental == null) {
            return {error: true, code: 404, message: 'No such rental'};
        }

        const {error} = await this.commitCancelRental(rental);

        if (error != null) {
            return {error: true, code: 500, message: `Transaction error: ${error}`};
        }

        return {error: false};
    }

    async finishRental(request: RentalProcessFinishRequest): Promise<RentalProcessFinishResponse> {
        let rental: Required<Rental> | null;

        try {
            rental = <Required<Rental>>await this.rentalsLogic.getOne(request.rentalUid);
        } catch (err) {
            console.log(err);
            return {error: true, code: 500, message: 'Rental service failure'};
        }

        if (rental == null) {
            return {error: true, code: 404, message: 'No such rental'};
        }

        const {error} = await this.commitFinishRental(rental);

        if (error != null) {
            return {error: true, code: 500, message: `Transaction error: ${error}`};
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
                        state.rental = <Required<Rental>>await this.rentalsLogic.create({
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
                undo: async () => {}
            }),
            new Transaction({
                do: async () => {await this.rentalsLogic.update(rental.rentalUid, {status: 'CANCELED'})},
                undo: async () => {}
            }),
            new Transaction({
                do: async () => {await this.paymentsLogic.update(rental.paymentUid, {status: 'CANCELED'})},
                undo: async () => {}
            }),
        );

        return chain.commit();
    }

    protected commitFinishRental(rental: Required<Rental>): Promise<TransactionCommitOutput<void>> {
        const chain = new TransactionChain<void>(
            new Transaction({
                do: async () => {await this.carsLogic.update(rental.carUid, {available: true})},
                undo: async () => {}
            }),
            new Transaction({
                do: async () => {await this.rentalsLogic.update(rental.rentalUid, {status: 'FINISHED'})},
                undo: async () => {}
            }),
        );

        return chain.commit();
    }

    private carsLogic: ConfigurableLogic<EntityLogic<Car, CarFilter, CarId>>;
    private paymentsLogic: ConfigurableLogic<EntityLogic<Payment, PaymentFilter, PaymentId>>;
    private rentalsLogic: ConfigurableLogic<EntityLogic<Omit<Rental, 'username'>, RentalFilter, RentalId>>;
    private rentalDereferenceLogic: ConfigurableLogic<RentalDereferenceUidsLogic>;
}
