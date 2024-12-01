import { 
    Car, CarFilter, CarId, 
    EntityClient, EntityLogic, EntityPaginationData, EntityPaginationFilter 
} from '@rsoi-lab2/library';

import { ConfigurableLogic, LogicOptions } from './interface';
import { getClientOptsFromLogicOptions } from './helpers';

export class CarsLogic implements 
    EntityLogic<Required<Car>, CarFilter, CarId>,
    ConfigurableLogic<CarsLogic>
{
    constructor(client: EntityClient<Required<Car>, CarFilter, CarId, true>) {
        this.client = client;
    }

    getIdType(): 'string' | 'number' {
        return 'string';
    }

    withOptions(options: LogicOptions): CarsLogic {
        return new CarsLogic(
            this.client.withOpts(getClientOptsFromLogicOptions(options))
        );
    }

    getOne(id: CarId): Promise<Required<Car> | null> {
        this.validateId(id);

        return this.client.getOne(id);
    }

    getMany(_: CarFilter): Promise<Array<Required<Car>>> {
        throw new Error('CarsLogic does not support non-paginated getMany(), use getPaginatedMany() instead');
    }

    getPaginatedMany(filter: CarFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Car>>> {
        return this.client.getMany(filter);
    }

    create(entity: Required<Car>): Promise<Required<Car>> {
        return this.client.create(entity);
    }

    update(id: CarId, update: Partial<Car>): Promise<Required<Car>> {
        this.validateId(id);

        return this.client.update(id, update);
    }

    delete(id: CarId): Promise<boolean> {
        this.validateId(id);

        return this.client.delete(id);
    }

    supportsPagination(): boolean {
        return true;
    }

    validateId(value: CarId): void {
        if (value.length === 0) {
            throw new Error('id must not be an empty string');
        }
    }

    validateEntity(value: Car): void {
        for(const key of [
            'brand', 'model', 'registrationNumber', 
            'price', 'power', 'type', 'available'
        ]) {
            if (!value.hasOwnProperty(key)) {
                throw new Error(`Invalid car: has no ${key} field value`);
            }
        }

        this.validatePartialEntity(value);
    }

    validateFilter(value: CarFilter): void {
        if (value.page <= 0 || value.size <= 0) {
            throw new Error('Invalid car filter: page and size must be both positive');
        }
    }

    validatePartialEntity(value: Partial<Car>): void {
        for(const key of ['carUid', 'brand', 'model', 'registrationNumber']) {
            if (value.hasOwnProperty(key) && value[key].length === 0) {
                throw new Error(`Invalid car: has empty ${key}`);
            }
        }

        for(const key of ['price', 'power']) {
            if (value.hasOwnProperty(key) && value[key] <= 0) {
                throw new Error(`Invalid car: has non-positive ${key}`);
            }
        }

        if (
            value.hasOwnProperty('type') && 
            !['SEDAN', 'SUV', 'MINIVAN', 'ROADSTER'].includes(value.type ?? '')
        ) {
            throw new Error(`Invalid car: has invalid type`);
        }
    }

    private client: EntityClient<Required<Car>, CarFilter, CarId, true>;
}
