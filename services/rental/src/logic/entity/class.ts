import { EntityLogic, EntityPaginationData, EntityPaginationFilter, EntityStorage } from "@rsoi-lab2/library";
import { Rental, RentalFilter, RentalId } from "./interface";

export class RentalLogic implements EntityLogic<Rental, RentalFilter, RentalId> {
    constructor(storage: EntityStorage<Rental, RentalFilter, RentalId>) {
        this.storage = storage;
    }

    getIdType(): "string" | "number" {
        return this.storage.getIdType();
    }

    async getOne(id: RentalId): Promise<Required<Rental> | null> {
        this.validateId(id);

        return this.storage.getOne(id);
    }

    async getMany(filter: RentalFilter): Promise<Array<Required<Rental>>> {
        this.validateFilter(filter);

        return this.storage.getMany(filter);
    }

    supportsPagination(): boolean {
        return this.storage.supportsPagination();
    }

    async getPaginatedMany(filter: RentalFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Rental>>> {
        this.validateFilter(filter);

        return this.storage.getPaginatedMany(filter);
    }

    async create(entity: Rental): Promise<Required<Rental>> {
        this.validateEntity(entity);

        return this.storage.create(entity);
    }

    async update(id: RentalId, update: Partial<Rental>): Promise<Required<Rental>> {
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
        for(const key of ['carUid', 'paymentUid', 'username', 'dateFrom', 'dateTo']) {
            if (!value.hasOwnProperty(key)) {
                throw new Error(`Invalid rental: must contain value in ${key} key`);
            }
        }

        this.validatePartialEntity(value);
    }

    validateFilter(value: RentalFilter): void {
        if(value.username.length === 0) {
            throw new Error('Invalid rental filter: has empty username');
        }
    }

    validatePartialEntity(value: Partial<Rental>): void {
        if (
            value.hasOwnProperty('dateFrom') && 
            value.hasOwnProperty('dateTo') && 
            value.dateFrom!.getTime() > value.dateTo!.getTime()
        ) {
            throw new Error('Invalid rental: has wrong dates order');
        }

        for(const key of ['carUid', 'paymentUid', 'username']) {
            if (value.hasOwnProperty(key) && value[key].length === 0) {
                throw new Error(`Invalid rental: must contain non-empty string in key ${key}`);
            }
        }
    }

    private storage: EntityStorage<Rental, RentalFilter, RentalId>;
}