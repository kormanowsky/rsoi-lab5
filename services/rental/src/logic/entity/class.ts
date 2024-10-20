import { EntityLogic, EntityPaginationData, EntityPaginationFilter, EntityStorage } from "@rsoi-lab2/library";
import { Rental, RentalFilter, RentalId } from "./interface";

export class RentalLogic implements EntityLogic<Rental, RentalFilter, RentalId> {
    constructor(storage: EntityStorage<Rental, RentalFilter, RentalId>) {
        this.storage = storage;
    }

    getIdType(): "string" | "number" {
        const typeOfSampleId = typeof this.storage.getSampleId();

        if (["string", "number"].includes(typeOfSampleId)) {
            return <'string' | 'number'>typeOfSampleId;
        }

        throw new Error(`Unexpected type of sample id: ${typeOfSampleId}`);
    }

    async getOne(id: RentalId): Promise<Rental | null> {
        this.validateId(id);

        return this.storage.getOne(id);
    }

    async getMany(filter: Rental): Promise<Rental[]> {
        this.validateFilter(filter);

        return this.storage.getMany(filter);
    }

    supportsPagination(): boolean {
        return this.storage.supportsPagination();
    }

    async getPaginatedMany(filter: RentalFilter & EntityPaginationFilter): Promise<EntityPaginationData<Rental>> {
        this.validateFilter(filter);

        return this.storage.getPaginatedMany(filter);
    }

    async create(entity: Rental): Promise<Rental> {
        this.validateEntity(entity);

        return this.storage.create(entity);
    }

    async update(id: RentalId, update: Partial<Rental>): Promise<Rental> {
        this.validateId(id);
        this.validatePartialEntity(update);

        return this.storage.update(id, update);
    }

    async delete(id: RentalId): Promise<boolean> {
        this.validateId(id);

        return this.storage.delete(id);
    }

    validateId(id: RentalId): void {
        if (id.length === 0) {
            throw new Error(`Invalid rental id: ${id}`);
        }
    }

    validateEntity(value: Rental): void {
        // TODO:
        return;
    }

    validateFilter(value: RentalFilter): void {
        // TODO:
        return;
    }

    validatePartialEntity(value: Partial<Rental>): void {
        // TODO:
        return;
    }

    private storage: EntityStorage<Rental, RentalFilter, RentalId>;
}