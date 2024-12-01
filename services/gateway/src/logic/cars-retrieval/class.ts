import { Car, CarFilter, CarId, EntityLogic } from "@rsoi-lab2/library";

import { ConfigurableLogic, LogicOptions } from "../interface";

import { CarsRetrievalRequest, CarsRetrievalResponse } from "./interface";

export class CarsRetrievalLogic implements ConfigurableLogic<CarsRetrievalLogic> {
    constructor(
        carsLogic: ConfigurableLogic<EntityLogic<Car, CarFilter, CarId>>
    ) {
        this.carsLogic = carsLogic;
    }

    async retrieveCars(request: CarsRetrievalRequest): Promise<CarsRetrievalResponse> {
        return {
            cars: await this.carsLogic.getPaginatedMany(request.filter)
        };
    }

    withOptions(options: LogicOptions): CarsRetrievalLogic {
        return new CarsRetrievalLogic(this.carsLogic.withOptions(options));
    }

    private carsLogic: ConfigurableLogic<EntityLogic<Car, CarFilter, CarId>>;
}