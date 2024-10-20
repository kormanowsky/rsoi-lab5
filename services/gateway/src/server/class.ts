import { Request, Response } from 'express';
import {Server} from '@rsoi-lab2/library';
import { CarsClient } from '../client';
import { Car, CarFilter } from '../../../cars/src/logic';
import { Rental } from '../../../rental/src/logic';

export class GatewayServer extends Server {
    constructor(carsClient: CarsClient, port: number) {
        super(port);
        this.carsClient = carsClient;
    }

    protected initRoutes(): void {
        this.getServer()
            .get('/api/v1/cars', this.getCars.bind(this))
            .post('/api/v1/rental', this.postRental.bind(this))
    }

    protected getCars(req: Request, res: Response): void {
        this.carsClient.getMany(
            {
                page: parseInt(<string>req.query.page ?? '1', 10),
                size: parseInt(<string>req.query.size ?? '15', 10),
                showAll: Boolean(<string>req.query.showAll ?? 'false')
            }
        ).then((data) => res.send(data)).catch((err) => {
            res.status(500).send({error: 'Cars service error'});
            console.error(err);
        });
    }

    protected async postRental(req: Request, res: Response): Promise<void> {
        const username = <string | undefined>req.headers['x-user-name'];

        if (username == null || username.length === 0) {
            res.status(401).send({error: 'Authentication failure'});
            return;
        }

        let rental: Partial<Rental>;

        try {
            rental = this.parseRentalRequest(req.body);
        } catch (err) {
            res.status(400).send({error: 'Bad request'});
            console.error(err);
            return;
        }

        rental.username = username;

        let car: Car | null;

        try {
            car = await this.carsClient.getOne(rental.carUid!);
        } catch(err) {
            res.status(500).send({error: 'Cars service failure'});
            console.error(err);
            return;
        }

        if (car == null) {
            res.status(400).send({error: 'Bad car id'});
            return;
        }

        if (!car.available) {
            res.status(403).send({error: 'Car is not available'});
            return;
        }

        // TODO: payment, rental, etc

        res.status(200).send();
    }

    protected parseRentalRequest(data: unknown): Partial<Rental> {
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

    private carsClient: CarsClient;
}