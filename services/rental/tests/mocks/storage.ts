import { 
    Rental, RentalFilter, RentalId, 
    EntityStorage, EntityPaginationFilter, EntityPaginationData 
} from "@rsoi-lab2/library";

export class MockRentalsStorage implements EntityStorage<Rental, RentalFilter, RentalId> {
    constructor(initialData: Array<Required<Rental>> = []) {
        this.storage = {};

        for(const rental of initialData) {
            this.storage[rental.rentalUid] = rental;
        }
    }

    async getOne(id: RentalId): Promise<Rental | null> {
        return this.storage[id] ?? null;
    }

    async getMany(filter: RentalFilter): Promise<Rental[]> {
        return Object.values(this.storage).filter(
            (rental): rental is Rental => rental != null && rental.username === filter.username
        );
    }

    async getPaginatedMany(_: RentalFilter & EntityPaginationFilter): Promise<EntityPaginationData<Rental>> {
        throw new Error('Pagination is not supported on Rentals!');
    }

    supportsPagination(): boolean {
        return false;
    }

    getIdType(): "string" | "number" {
        return "string";
    }

    async create(entity: Rental): Promise<Rental> {
        const preparedEntity = {
            ...entity,
            id: this.id,
            rentalUid: `rental-uid-${this.id}`
        };
        this.id++;
        this.storage[preparedEntity.rentalUid] = preparedEntity;
        return preparedEntity;
    }

    async update(id: RentalId, update: Partial<Rental>): Promise<Rental> {
        if (this.storage.hasOwnProperty(id)) {
            return Object.assign(this.storage[id]!, update);
        }

        throw new Error(`Update failed: id = ${id} does not exist`);
    }

    async delete(id: RentalId): Promise<boolean> {
        delete this.storage[id];
        return true;
    }

    private storage: Partial<Record<RentalId, Rental>>;
    private id: number = 0;
}