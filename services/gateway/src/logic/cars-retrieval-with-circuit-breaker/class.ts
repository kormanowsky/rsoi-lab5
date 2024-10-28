import { Car, CarFilter, CarId, CircuitBreaker, EntityLogic } from "@rsoi-lab2/library";
import { CarsRetrievalLogic, CarsRetrievalRequest, CarsRetrievalResponse } from "../cars-retrieval";

export class CBCarsRetrievalLogic extends CarsRetrievalLogic {
    constructor(cb: CircuitBreaker, carsLogic: EntityLogic<Car, CarFilter, CarId>) {
        super(carsLogic);
        this.cb = cb;

        this.cb.register({
            id: this.retrieveCarsOperationId, 
            realOperation: (request: CarsRetrievalRequest) => super.retrieveCars(request),
            fallbackOperation: (request: CarsRetrievalRequest) => this.retrieveCarsFallback(request)
        });
    }

    async retrieveCars(request: CarsRetrievalRequest): Promise<CarsRetrievalResponse> {
        return this.cb.dispatch(this.retrieveCarsOperationId, request);
    }

    protected async retrieveCarsFallback(_: CarsRetrievalRequest): Promise<CarsRetrievalResponse> {
        return {
            cars: {
                items: [],
                totalElements: 0,
                page: 1,
                pageSize: 0
            }
        };
    }

    private cb: CircuitBreaker;
    private readonly retrieveCarsOperationId = 'retrieveCars';
}
