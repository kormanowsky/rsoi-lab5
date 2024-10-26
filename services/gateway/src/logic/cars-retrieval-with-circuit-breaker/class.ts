import { Car, CarFilter, CarId, CircuitBreaker, EntityLogic } from "@rsoi-lab2/library";
import { CarsRetrievalLogic, CarsRetrievalRequest, CarsRetrievalResponse } from "../cars-retrieval";

export class CBCarsRetrievalLogic extends CarsRetrievalLogic {
    constructor(cb: CircuitBreaker, carsLogic: EntityLogic<Car, CarFilter, CarId>) {
        super(carsLogic);
        this.cb = cb;
    }

    async retrieveCars(request: CarsRetrievalRequest): Promise<CarsRetrievalResponse> {
        if (this.cb.isClosed()) {
            return this.retrieveCarsFallback();
        }

        try {
            return super.retrieveCars(request);
        } catch (err) {
            this.cb.reportError();
            setTimeout(() => this.tryRestoreCarsService(request), 5000);
            return this.retrieveCarsFallback();
        }
    }

    protected retrieveCarsFallback(): CarsRetrievalResponse {
        return {
            cars: {
                items: [],
                totalElements: 0,
                page: 1,
                pageSize: 0
            }
        };
    }

    protected async tryRestoreCarsService(request: CarsRetrievalRequest): Promise<void> {
        try {
            await super.retrieveCars(request);
            this.cb.reset();
        } catch (err) {
            console.warn('When trying to restore cars service:');
            console.warn(err);
        }
    }

    private cb: CircuitBreaker;
}
