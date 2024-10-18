import { Request, Response } from 'express';
import {Server} from '@rsoi-lab2/library';
import { CarsClient } from '../client';
import { CarFilter } from '../../../cars/src/logic';

export class GatewayServer extends Server {
    constructor(carsClient: CarsClient, port: number) {
        super(port);
        this.carsClient = carsClient;
    }

    protected initRoutes(): void {
        this.getServer()
            .get('/api/v1/cars', this.getCars.bind(this));
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

    private carsClient: CarsClient;
}