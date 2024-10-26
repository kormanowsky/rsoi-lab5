import { Car, CarFilter, CarId, EntityLogic } from "@rsoi-lab2/library";
import { CarsRetrievalRequest, CarsRetrievalResponse } from "./interface";

export class CarsRetrievalLogic {
    constructor(carsLogic: EntityLogic<Car, CarFilter, CarId>) {
        this.carsLogic = carsLogic;
    }

    async retrieveCars(request: CarsRetrievalRequest): Promise<CarsRetrievalResponse> {
        return {cars: await this.carsLogic.getPaginatedMany(request.filter)};
    }

    private carsLogic: EntityLogic<Car, CarFilter, CarId>;
}