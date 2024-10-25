import { 
    Car, CarFilter, CarId, 
    EntityStorage, EntityPaginationFilter, EntityPaginationData } from '@rsoi-lab2/library';

export class MockCarsStorage implements EntityStorage<Car, CarFilter, CarId> {
    constructor(initialData: Array<Required<Car>> = []) {
        this.storage = {};

        for(const car of initialData) {
            this.storage[car.carUid] = car;
        }
    }

    async getOne(id: CarId): Promise<Required<Car> | null> {
        return this.storage[id] ?? null;
    }

    async getMany(filter: CarFilter): Promise<Array<Required<Car>>> {
        return Object.values(this.storage).filter(
            (car?: Required<Car>): car is Required<Car> => car != null && (car.available || filter.showAll)
        );
    }

    async getPaginatedMany(filter: CarFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Car>>> {
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

    getIdType(): 'string' | 'number' {
        return 'string';
    }

    async create(entity: Car): Promise<Required<Car>> {
        const preparedEntity = {
            ...entity,
            id: this.id,
            carUid: `car-uid-${this.id}`
        };
        this.id++;
        this.storage[preparedEntity.carUid] = preparedEntity;
        return preparedEntity;
    }

    async update(id: CarId, update: Partial<Car>): Promise<Required<Car>> {
        if (this.storage.hasOwnProperty(id)) {
            return Object.assign(this.storage[id]!, update);
        }

        throw new Error(`Update failed: id = ${id} does not exist`);
    }

    async delete(id: CarId): Promise<boolean> {
        delete this.storage[id];
        return true;
    }

    private storage: Partial<Record<CarId, Required<Car>>>;
    private id: number = 0;
}