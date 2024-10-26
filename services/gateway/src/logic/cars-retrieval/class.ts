import { Car, CarFilter, CarId, EntityLogic } from "@rsoi-lab2/library";
import { CarsRetrievalRequest, CarsRetrievalResponse } from "./interface";

export class CarsRetrievalLogic {
    constructor(carsLogic: EntityLogic<Car, CarFilter, CarId>) {
        this.carsLogic = carsLogic;
    }

    async retrieveCars(request: CarsRetrievalRequest): Promise<CarsRetrievalResponse> {
        try {
            return {error: false, cars: await this.carsLogic.getPaginatedMany(request.filter)};
        } catch (err) {
            return {error: true, code: 503, message: 'Cars Service unavailable'};
        }
    }

    private carsLogic: EntityLogic<Car, CarFilter, CarId>;
}