import { EntityLogic, EntityPaginationData, EntityPaginationFilter, EntityStorage } from "@rsoi-lab2/library";
import { Car, CarFilter, CarId } from "./interface";

export class CarsLogic implements EntityLogic<Car, CarFilter, CarId> {
    constructor(storage: EntityStorage<Car, CarFilter, CarId>) {
        this.storage = storage;
    }

    getIdType(): "string" | "number" {
        return this.storage.getIdType();
    }

    async getOne(id: CarId): Promise<Required<Car> | null> {
        this.validateId(id);

        return this.storage.getOne(id);
    }

    async getMany(filter: CarFilter): Promise<Array<Required<Car>>> {
        this.validateFilter(filter);

        return this.storage.getMany(filter);
    }

    supportsPagination(): boolean {
        return this.storage.supportsPagination();
    }

    async getPaginatedMany(filter: CarFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Car>>> {
        this.validateFilter(filter);

        return this.storage.getPaginatedMany(filter);
    }

    async create(entity: Car): Promise<Required<Car>> {
        this.validateEntity(entity);

        return this.storage.create(entity);
    }

    async update(id: CarId, update: Partial<Car>): Promise<Required<Car>> {
        this.validateId(id);
        this.validatePartialEntity(update);

        return this.storage.update(id, update);
    }

    async delete(id: CarId): Promise<boolean> {
        this.validateId(id);

        return this.storage.delete(id);
    }

    validateId(id: CarId): void {
        if (id.length === 0) {
            throw new Error(`Invalid car id: ${id}`);
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

    private storage: EntityStorage<Car, CarFilter, CarId>;
}
