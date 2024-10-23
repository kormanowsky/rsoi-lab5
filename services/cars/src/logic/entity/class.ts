import { EntityLogic, EntityPaginationData, EntityPaginationFilter, EntityStorage } from "@rsoi-lab2/library";
import { Car, CarFilter, CarId } from "./interface";

export class CarsLogic implements EntityLogic<Car, CarFilter, CarId> {
    constructor(storage: EntityStorage<Car, CarFilter, CarId>) {
        this.storage = storage;
    }

    getIdType(): "string" | "number" {
        return this.storage.getIdType();
    }

    async getOne(id: CarId): Promise<Car | null> {
        this.validateId(id);

        return this.storage.getOne(id);
    }

    async getMany(filter: CarFilter): Promise<Car[]> {
        this.validateFilter(filter);

        return this.storage.getMany(filter);
    }

    supportsPagination(): boolean {
        return this.storage.supportsPagination();
    }

    async getPaginatedMany(filter: CarFilter & EntityPaginationFilter): Promise<EntityPaginationData<Car>> {
        this.validateFilter(filter);

        return this.storage.getPaginatedMany(filter);
    }

    async create(entity: Car): Promise<Car> {
        this.validateEntity(entity);

        return this.storage.create(entity);
    }

    async update(id: CarId, update: Partial<Car>): Promise<Car> {
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
        // TODO:
        return;
    }

    validateFilter(value: CarFilter): void {
        // TODO:
        return;
    }

    validatePartialEntity(value: Partial<Car>): void {
        // TODO:
        return;
    }

    private storage: EntityStorage<Car, CarFilter, CarId>;
}