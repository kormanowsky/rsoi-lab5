import { 
    Rental, RentalFilter, RentalId, 
    EntityStorage, EntityPaginationFilter, EntityPaginationData 
} from '@rsoi-lab2/library';

export class MockRentalsStorage implements EntityStorage<Rental, RentalFilter, RentalId> {
    constructor(initialData: Array<Required<Rental>> = []) {
        this.storage = {};

        for(const rental of initialData) {
            this.storage[rental.rentalUid] = rental;
        }
    }

    async getOne(id: RentalId): Promise<Required<Rental> | null> {
        return this.storage[id] ?? null;
    }

    async getMany(_: Omit<RentalFilter, 'username'>): Promise<Array<Required<Rental>>> {
        return Object.values(this.storage);
    }

    async getPaginatedMany(_: RentalFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Rental>>> {
        throw new Error('Pagination is not supported on Rentals!');
    }

    supportsPagination(): boolean {
        return false;
    }

    getIdType(): 'string' | 'number' {
        return 'string';
    }

    async create(entity: Rental): Promise<Required<Rental>> {
        const preparedEntity = {
            ...entity,
            id: this.id,
            rentalUid: `rental-uid-${this.id}`
        };
        this.id++;
        this.storage[preparedEntity.rentalUid] = preparedEntity;
        return preparedEntity;
    }

    async update(id: RentalId, update: Partial<Rental>): Promise<Required<Rental>> {
        if (this.storage.hasOwnProperty(id)) {
            return Object.assign(this.storage[id]!, update);
        }

        throw new Error(`Update failed: id = ${id} does not exist`);
    }

    async delete(id: RentalId): Promise<boolean> {
        delete this.storage[id];
        return true;
    }

    private storage: Partial<Record<RentalId, Required<Rental>>>;
    private id: number = 0;
}