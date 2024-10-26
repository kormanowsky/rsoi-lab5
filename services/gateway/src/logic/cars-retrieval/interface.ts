import { Car, CarFilter, EntityPaginationData } from "@rsoi-lab2/library";

export interface RetrievedCars extends EntityPaginationData<Required<Car>>{}

export interface CarsRetrievalRequest {
    filter: CarFilter;
}

export type CarsRetrievalResponse = {cars: RetrievedCars};
