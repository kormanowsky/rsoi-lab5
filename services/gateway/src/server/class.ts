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
        port: number
    ) {
        super(port);
        this.carsLogic = carsLogic;
        this.rentalRetrievalLogic = rentalRetrievalLogic;
        this.rentalProcessLogic = rentalProcessLogic;
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
        let username: string;

        try {
            username = this.parseUsername(req.headers['x-user-name']);
        } catch (err) {
            res.status(401).send({error: 'Authentication failure'});
            console.log(err);
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
        let username: string;

        try {
            username = this.parseUsername(req.headers['x-user-name']);
        } catch (err) {
            res.status(401).send({error: 'Authentication failure'});
            console.log(err);
            return;
        }

        let rentalUid: Rental['rentalUid'];

        try {
            rentalUid = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({error: 'Bad ID'});
            console.error(err);
            return;
        }

        try {

            const {rental} = await this.rentalRetrievalLogic.retrieveRental({rentalUid, username});

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
        let username: string;

        try {
            username = this.parseUsername(req.headers['x-user-name']);
        } catch (err) {
            res.status(401).send({error: 'Authentication failure'});
            console.log(err);
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
        let username: string;

        try {
            username = this.parseUsername(req.headers['x-user-name']);
        } catch (err) {
            res.status(401).send({error: 'Authentication failure'});
            console.log(err);
            return;
        }

        let rentalUid: Rental['rentalUid'];

        try {
            rentalUid = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({error: 'Bad ID'});
            console.error(err);
            return;
        }

        const response = await this.rentalProcessLogic.finishRental({
            rentalUid, 
            username
        });

        if (response.error) {
            res.status(response.code).send({error: response.message});
        } else {
            res.status(204).send();
        }
    }

    protected async cancelRental(req: Request, res: Response): Promise<void> {
        let username: string;

        try {
            username = this.parseUsername(req.headers['x-user-name']);
        } catch (err) {
            res.status(401).send({error: 'Authentication failure'});
            console.log(err);
            return;
        }

        let rentalUid: Rental['rentalUid'];

        try {
            rentalUid = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({error: 'Bad ID'});
            console.error(err);
            return;
        }

        const response = await this.rentalProcessLogic.cancelRental({
            rentalUid, 
            username
        });

        if (response.error) {
            res.status(response.code).send({error: response.message});
        } else {
            res.status(204).send();
        }
    }

    protected parseUsername(value: unknown): string {
        if (typeof value !== 'string' || value.length === 0) {
            throw new Error('Incorrect username');
        }

        return value;
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

    protected parseRentalRequest(value: unknown): Pick<Rental, 'dateFrom' | 'dateTo' | 'carUid'> {
        if (typeof value !== 'object' || value == null) {
            throw new Error(`Rental request data must be non-nullish object`);
        }

        const dataAsRecord = <Record<string, string>>value;

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
}