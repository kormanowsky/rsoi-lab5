import { Request, Response } from 'express';
import { Server, Car, Rental, Payment, EntityLogic, CarFilter, CarId } from '@rsoi-lab2/library';
import { PaymentsClient, RentalsClient } from '../client';
import { RentalProcessLogic, RentalRetrievalLogic, RetrievedRental } from '../logic';

type RentalResponse = Omit<RetrievedRental, 'dateFrom' | 'dateTo'> & {
    dateFrom: string;
    dateTo: string;
}

export class GatewayServer extends Server {
    constructor(
        carsLogic: EntityLogic<Car, CarFilter, CarId>, 
        rentalRetrievalLogic: RentalRetrievalLogic,
        rentalProcessLogic: RentalProcessLogic,
        paymentsClient: PaymentsClient,
        rentalsClient: RentalsClient,
        port: number
    ) {
        super(port);
        this.carsLogic = carsLogic;
        this.rentalRetrievalLogic = rentalRetrievalLogic;
        this.rentalProcessLogic = rentalProcessLogic;
        this.paymentsClient = paymentsClient;
        this.rentalsClient = rentalsClient;
    }

    protected initRoutes(): void {
        this.getServer()
            .get('/api/v1/cars', this.getCars.bind(this))
            .get('/api/v1/rental', this.getRentals.bind(this))
            .get('/api/v1/rental/:id', this.getRental.bind(this))
            .post('/api/v1/rental', this.startRental.bind(this))
            .post('/api/v1/rental/:id/finish', this.finishRental.bind(this))
            .delete('/api/v1/rental/:id', this.cancelRental.bind(this));
    }

    protected getCars(req: Request, res: Response): void {
        const parsedFilter = this.parseCarFilter(req.query);

        this.carsLogic
            .getPaginatedMany(parsedFilter)
            .then((data) => res.send(data))
            .catch((err) => {
                res.status(500).send({error: 'Cars service error'});
                console.error(err);
            });
    }

    protected getRentals(req: Request, res: Response): void {
        const username = <string | undefined>req.headers['x-user-name'];

        if (username == null || username.length === 0) {
            res.status(401).send({error: 'Authentication failure'});
            return;
        }

        this.rentalRetrievalLogic
            .retrieveRentals({username})
            .then(({rentals}) => rentals.map(this.dumpRental.bind(this)))
            .then(res.send.bind(res))
            .catch((err) => {
                res.status(500).send({error: 'Rental retrieval failure'});
                console.error(err);
            });
    }

    protected async getRental(req: Request, res: Response): Promise<void> {
        const username = <string | undefined>req.headers['x-user-name'];

        if (username == null || username.length === 0) {
            res.status(401).send({error: 'Authentication failure'});
            return;
        }

        let parsedId: Rental['rentalUid'];

        try {
            parsedId = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({error: 'Bad ID'});
            console.error(err);
            return;
        }

        try {

            const {rental} = await this.rentalRetrievalLogic.retrieveRental({rentalUid: parsedId, username});

            if (rental == null) {
                res.status(404).send({error: 'No such rental'});
                return;
            }

            res.send(this.dumpRental(rental));

        } catch (err) {
            res.status(500).send({error: 'Rental service failure'});
            console.error(err);
        }
    }

    protected async startRental(req: Request, res: Response): Promise<void> {
        const username = <string | undefined>req.headers['x-user-name'];

        if (username == null || username.length === 0) {
            res.status(401).send({error: 'Authentication failure'});
            return;
        }

        let rentalRequest: Pick<Rental, 'dateFrom' | 'dateTo' | 'carUid'>;

        try {
            rentalRequest = this.parseRentalRequest(req.body);
        } catch (err) {
            res.status(400).send({error: 'Bad request'});
            console.error(err);
            return;
        }

        const response = await this.rentalProcessLogic.startRental({
            ...rentalRequest, 
            username
        });

        if (response.error) {
            res.status(response.code).send({error: response.message});
        } else {
            res.send(this.dumpRental(response.rental));
        }
    }

    protected async finishRental(req: Request, res: Response): Promise<void> {
        const username = <string | undefined>req.headers['x-user-name'];

        if (username == null || username.length === 0) {
            res.status(401).send({error: 'Authentication failure'});
            return;
        }

        let parsedId: Rental['rentalUid'];

        try {
            parsedId = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({error: 'Bad ID'});
            console.error(err);
            return;
        }

        this.rentalsClient.getOne(parsedId).then(async (rental) => {
            if (rental == null || rental.username !== username) {
                res.status(404).send({error: 'No such rental'});
                return;
            }

            await this.carsLogic.update(rental.carUid, {available: true});
            await this.rentalsClient.update(rental.rentalUid, {status: 'FINISHED'});

            res.status(204).send();
        }).catch((err) => {
            res.status(500).send({error: 'Internal failure'});
            console.error(err);
        });
    }

    protected async cancelRental(req: Request, res: Response): Promise<void> {
        const username = <string | undefined>req.headers['x-user-name'];

        if (username == null || username.length === 0) {
            res.status(401).send({error: 'Authentication failure'});
            return;
        }

        let parsedId: Rental['rentalUid'];

        try {
            parsedId = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({error: 'Bad ID'});
            console.error(err);
            return;
        }

        this.rentalsClient.getOne(parsedId).then(async (rental) => {
            if (rental == null || rental.username !== username) {
                res.status(404).send({error: 'No such rental'});
                return;
            }

            await this.carsLogic.update(rental.carUid, {available: true});
            await this.rentalsClient.update(rental.rentalUid, {status: 'CANCELED'});
            await this.paymentsClient.update(rental.paymentUid, {status: 'CANCELED'});

            res.status(204).send();
        }).catch((err) => {
            res.status(500).send({error: 'Internal failure'});
            console.error(err);
        });
    }

    protected parseId(value: unknown): string {
        if (typeof value !== 'string') {
            throw new Error(`Invalid id: must be a string, got: ${value}`);
        }

        return value;
    }

    protected parseCarFilter(value: unknown): CarFilter {
        if (typeof value !== 'object' || value == null) {
            throw new Error('Car filter must be a non-nullish object');
        }

        const parsedFilter = {
            page: 1,
            size: 10,
            showAll: false
        };

        for(const key of ['page', 'size']) {
            if (value.hasOwnProperty(key)) {
                const intValue = parseInt(value[key], 10);

                if (isNaN(intValue)) {
                    throw new Error(`Invalid key ${key} in car filter, must be an int`);
                }

                parsedFilter[key] = intValue;
            }
        }

        if (value.hasOwnProperty('showAll') && value['showAll'] !== 'false') {
            parsedFilter.showAll = Boolean(value['showAll']);
        }

        return parsedFilter;
    }

    protected parseRentalRequest(data: unknown): Pick<Rental, 'dateFrom' | 'dateTo' | 'carUid'> {
        if (typeof data !== 'object' || data == null) {
            throw new Error(`Rental request data must be non-nullish object`);
        }

        const dataAsRecord = <Record<string, string>>data;

        for(const key of ['carUid', 'dateFrom', 'dateTo']) {
            if (!dataAsRecord.hasOwnProperty(key)) {
                throw new Error(`Rental request data must contain ${key} key`);
            }
        }

        if (dataAsRecord.carUid.length === 0) {
            throw new Error(`Rental request data must contain valid carUid`);
        }

        const 
            carUid = dataAsRecord.carUid,
            dateFrom = new Date(dataAsRecord.dateFrom),
            dateTo = new Date(dataAsRecord.dateTo);

        if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
            throw new Error(`Rental request data must contain valid dates in dateFrom and dateTo fields`);
        }

        return {carUid, dateFrom, dateTo};
    }

    protected dumpRental(rental: RetrievedRental): RentalResponse {
        return {
            ...rental,
            dateFrom: rental.dateFrom.toISOString().split('T')[0],
            dateTo: rental.dateTo.toISOString().split('T')[0]
        };
    }

    private carsLogic: EntityLogic<Car, CarFilter, CarId>;
    private rentalRetrievalLogic: RentalRetrievalLogic;
    private rentalProcessLogic: RentalProcessLogic;
    private paymentsClient: PaymentsClient;
    private rentalsClient: RentalsClient;
}