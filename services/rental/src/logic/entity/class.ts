import { ConfigurableLogic, EntityLogic, EntityPaginationData, EntityPaginationFilter, EntityStorage, LogicOptions } from '@rsoi-lab2/library';
import { Rental, RentalFilter, RentalId } from './interface';

export class RentalLogic implements 
    EntityLogic<Rental, RentalFilter, RentalId>,
    ConfigurableLogic<RentalLogic> 
{
    constructor(
        storage: EntityStorage<Rental, RentalFilter, RentalId>,
        options?: LogicOptions
    ) {
        this.storage = storage;
        this.options = options;
    }

    getIdType(): 'string' | 'number' {
        return this.storage.getIdType();
    }

    withOptions(options: LogicOptions): ConfigurableLogic<RentalLogic, LogicOptions> {
        return new RentalLogic(this.storage, options);
    }

    async getOne(id: RentalId): Promise<Required<Rental> | null> {
        if (this.options == null) {
            return Promise.reject(new Error('Rental logic not configured'));
        }

        this.validateId(id);

        const rental = await this.storage.getOne(id);

        if (rental.username !== this.options.username) {
            return null;
        }

        return rental;
    }

    async getMany(filter: RentalFilter): Promise<Array<Required<Rental>>> {
        if (this.options == null) {
            return Promise.reject(new Error('Rental logic not configured'));
        }

        this.validateFilter(filter);

        filter.username = this.options.username;

        return this.storage.getMany(filter);
    }

    supportsPagination(): boolean {
        return this.storage.supportsPagination();
    }

    async getPaginatedMany(filter: RentalFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Rental>>> {
        if (this.options == null) {
            return Promise.reject(new Error('Rental logic not configured'));
        }

        this.validateFilter(filter);

        filter.username = this.options.username;

        return this.storage.getPaginatedMany(filter);
    }

    async create(entity: Rental): Promise<Required<Rental>> {
        if (this.options == null) {
            return Promise.reject(new Error('Rental logic not configured'));
        }

        this.validateEntity(entity);

        entity.username = this.options.username;

        return this.storage.create(entity);
    }

    async update(id: RentalId, update: Partial<Rental>): Promise<Required<Rental>> {
        if (this.options == null) {
            return Promise.reject(new Error('Rental logic not configured'));
        }

        this.validateId(id);
        this.validatePartialEntity(update);

        const rental = await this.storage.getOne(id);

        if (rental == null) {
            return Promise.reject(new Error('Did not update'));
        }

        return this.storage.update(id, update);
    }

    async delete(id: RentalId): Promise<boolean> {
        if (this.options == null) {
            return Promise.reject(new Error('Rental logic not configured'));
        }

        this.validateId(id);

        const rental = await this.storage.getOne(id);

        if (rental == null) {
            return false;
        }

        return this.storage.delete(id);
    }

    validateId(id: RentalId): void {
        if (id.length === 0) {
            throw new Error(`Invalid rental id: ${id}`);
        }
    }

    validateEntity(value: Rental): void {
        for(const key of ['carUid', 'paymentUid', 'dateFrom', 'dateTo']) {
            if (!value.hasOwnProperty(key)) {
                throw new Error(`Invalid rental: must contain value in ${key} key`);
            }
        }

        this.validatePartialEntity(value);
    }

    validateFilter(_: RentalFilter): void {
        
    }

    validatePartialEntity(value: Partial<Rental>): void {
        if (
            value.hasOwnProperty('dateFrom') && 
            value.hasOwnProperty('dateTo') && 
            value.dateFrom!.getTime() > value.dateTo!.getTime()
        ) {
            throw new Error('Invalid rental: has wrong dates order');
        }

        for(const key of ['carUid', 'paymentUid']) {
            if (value.hasOwnProperty(key) && value[key].length === 0) {
                throw new Error(`Invalid rental: must contain non-empty string in key ${key}`);
            }
        }

        if (value.hasOwnProperty('username')) {
            throw new Error('Invalid rental: has username');
        }
    }

    private storage: EntityStorage<Rental, RentalFilter, RentalId>;
    private options?: LogicOptions;
}