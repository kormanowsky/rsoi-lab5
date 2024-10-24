import { 
    Car, CarFilter, CarId, 
    EntityStorage, EntityPaginationFilter, EntityPaginationData } from "@rsoi-lab2/library";

export class MockCarsStorage implements EntityStorage<Car, CarFilter, CarId> {
    constructor(initialData: Car[] = []) {
        this.storage = {};

        for(const car of initialData) {
            this.storage[car.carUid] = car;
        }
    }

    async getOne(id: CarId): Promise<Car | null> {
        return this.storage[id] ?? null;
    }

    async getMany(filter: CarFilter): Promise<Car[]> {
        return Object.values(this.storage).filter(
            (car?: Car): car is Car => car != null && (car.available || filter.showAll)
        );
    }

    async getPaginatedMany(filter: CarFilter & EntityPaginationFilter): Promise<EntityPaginationData<Car>> {
        const filtered = await this.getMany(filter);

        const 
            start = (filter.page - 1) * filter.size,
            end = start + filter.size;

        return {
            items: filtered.slice(start, end),
            pageSize: filter.size,
            page: filter.page,
            totalElements: filtered.length
        };
    }

    supportsPagination(): boolean {
        return true;
    }

    getIdType(): "string" | "number" {
        return "string";
    }

    async create(entity: Car): Promise<Car> {
        const preparedEntity = {
            ...entity,
            id: this.id,
            carUid: `car-uid-${this.id}`
        };
        this.id++;
        this.storage[preparedEntity.carUid] = preparedEntity;
        return preparedEntity;
    }

    async update(id: CarId, update: Partial<Car>): Promise<Car> {
        if (this.storage.hasOwnProperty(id)) {
            return Object.assign(this.storage[id]!, update);
        }

        throw new Error(`Update failed: id = ${id} does not exist`);
    }

    async delete(id: CarId): Promise<boolean> {
        delete this.storage[id];
        return true;
    }

    private storage: Partial<Record<CarId, Car>>;
    private id: number = 0;
}