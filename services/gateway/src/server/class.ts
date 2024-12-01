import { Server, ServerRequest, ServerResponse, Car, Rental, EntityLogic, CarFilter, CarId, Middleware } from '@rsoi-lab2/library';
import { CarsRetrievalLogic, RentalProcessLogic, RentalRetrievalLogic, RetrievedRental } from '../logic';

type RentalServerResponse = Omit<RetrievedRental, 'dateFrom' | 'dateTo'> & {
    dateFrom: string;
    dateTo: string;
}

export class GatewayServer extends Server {
    constructor(
        carsRetrievalLogic: CarsRetrievalLogic,
        rentalRetrievalLogic: RentalRetrievalLogic,
        rentalProcessLogic: RentalProcessLogic,
        authMiddleware: Middleware,
        port: number
    ) {
        super(port);
        this.carsRetrievalLogic = carsRetrievalLogic;
        this.rentalRetrievalLogic = rentalRetrievalLogic;
        this.rentalProcessLogic = rentalProcessLogic;
        this.authMiddleware = authMiddleware;
    }

    protected initRoutes(): void {
        const 
            server = this.getServer(),
            authHandlers = this.authMiddleware.getHandlers();

        this.authMiddleware.prepareApp(server);

        server
            .get('/api/v1/cars', authHandlers, this.getCars.bind(this))
            .get('/api/v1/rental', authHandlers, this.getRentals.bind(this))
            .get('/api/v1/rental/:id', authHandlers, this.getRental.bind(this))
            .post('/api/v1/rental', authHandlers, this.startRental.bind(this))
            .post('/api/v1/rental/:id/finish', authHandlers, this.finishRental.bind(this))
            .delete('/api/v1/rental/:id', authHandlers, this.cancelRental.bind(this));
    }

    protected getCars(req: ServerRequest, res: ServerResponse): void {
        const filter = this.parseCarFilter(req.query);

        this.carsRetrievalLogic
            .withOptions({authCredential: req.user.credential})
            .retrieveCars({filter})
            .then(({cars}) => res.send(cars))
            .catch((err) => {
                res.status(500).send({message: 'Cars service error'});
                console.error(err);
            });
    }

    protected getRentals(req: ServerRequest, res: ServerResponse): void {
        const {username} = req.user;

        this.rentalRetrievalLogic
            .retrieveRentals({username})
            .then(({rentals}) => rentals.map(this.dumpRental.bind(this)))
            .then(res.send.bind(res))
            .catch((err) => {
                res.status(500).send({messa: 'Rental retrieval failure'});
                console.error(err);
            });
    }

    protected async getRental(req: ServerRequest, res: ServerResponse): Promise<void> {
        let rentalUid: Rental['rentalUid'];

        try {
            rentalUid = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({message: 'Bad ID'});
            console.error(err);
            return;
        }

        const {username} = req.user;

        try {

            const {rental} = await this.rentalRetrievalLogic.retrieveRental({rentalUid, username});

            if (rental == null) {
                res.status(404).send({message: 'No such rental'});
                return;
            }

            res.send(this.dumpRental(rental));

        } catch (err) {
            res.status(500).send({message: 'Rental service failure'});
            console.error(err);
        }
    }

    protected async startRental(req: ServerRequest, res: ServerResponse): Promise<void> {
        let rentalServerRequest: Pick<Rental, 'dateFrom' | 'dateTo' | 'carUid'>;

        try {
            rentalServerRequest = this.parseRentalServerRequest(req.body);
        } catch (err) {
            res.status(400).send({message: 'Bad request'});
            console.error(err);
            return;
        }

        const {username} = req.user;

        const response = await this.rentalProcessLogic.startRental({
            ...rentalServerRequest, 
            username
        });

        if (response.error === true) {
            res.status(response.code).send({message: response.message});
        } else {
            res.send(this.dumpRental(response.rental));
        }
    }

    protected async finishRental(req: ServerRequest, res: ServerResponse): Promise<void> {
        let rentalUid: Rental['rentalUid'];

        try {
            rentalUid = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({message: 'Bad ID'});
            console.error(err);
            return;
        }

        const {username} = req.user;

        const response = await this.rentalProcessLogic.finishRental({
            rentalUid, 
            username
        });

        if (response.error) {
            res.status(response.code).send({message: response.message});
        } else {
            res.status(204).send();
        }
    }

    protected async cancelRental(req: ServerRequest, res: ServerResponse): Promise<void> {
        let rentalUid: Rental['rentalUid'];

        try {
            rentalUid = this.parseId(req.params.id);
        } catch (err) {
            res.status(400).send({message: 'Bad ID'});
            console.error(err);
            return;
        }

        const {username} = req.user;

        const response = await this.rentalProcessLogic.cancelRental({
            rentalUid, 
            username
        });

        if (response.error) {
            res.status(response.code).send({message: response.message});
        } else {
            res.status(204).send();
        }
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

    protected parseRentalServerRequest(value: unknown): Pick<Rental, 'dateFrom' | 'dateTo' | 'carUid'> {
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

    protected dumpRental(rental: RetrievedRental): RentalServerResponse {
        return {
            ...rental,
            dateFrom: rental.dateFrom.toISOString().split('T')[0],
            dateTo: rental.dateTo.toISOString().split('T')[0]
        };
    }

    private carsRetrievalLogic: CarsRetrievalLogic;
    private rentalRetrievalLogic: RentalRetrievalLogic;
    private rentalProcessLogic: RentalProcessLogic;
    private authMiddleware: Middleware;
}