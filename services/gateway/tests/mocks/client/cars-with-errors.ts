import { Car, CarFilter, CarId, EntityPaginationData } from "@rsoi-lab2/library";
import { MockCarsClient } from "./cars";

export class MockCarsWithErrorsClient extends MockCarsClient {
    getOne(_: CarId): Promise<Required<Car> | null> {
        throw new Error('errored');
    }

    getMany(_: CarFilter): Promise<EntityPaginationData<Required<Car>>> {
        throw new Error('errored');
    }

    create(_: Car): Promise<Required<Car>> {
        throw new Error('errored');
    }

    update(_: CarId, __: Partial<Car>): Promise<Required<Car>> {
        throw new Error('errored');
    }

    delete(_: CarId): Promise<boolean> {
        throw new Error('errored');
    }

    getIdType(): "string" | "number" {
        return 'string';
    }
}