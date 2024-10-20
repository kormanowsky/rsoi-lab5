import { EntityPaginationFilter, EntityServer } from '@rsoi-lab2/library';

import { Car, CarFilter, CarId } from '../logic';

export class CarsServer extends EntityServer<Car, CarFilter, CarId> {
    parseEntity(value: unknown): Car {
        // TODO: 
        return <Car>value;
    }

    parsePartialEntity(value: unknown): Partial<Car> {
        // TODO: 
        return <Car>value;
    }

    parseFilter(value: unknown): CarFilter {
        // TODO:
        return <CarFilter>value;
    }

    parsePaginationFilter(value: unknown): CarFilter & EntityPaginationFilter {
        // TODO: 
        return <CarFilter & EntityPaginationFilter>value;
    }
}