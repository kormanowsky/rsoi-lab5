import { 
    Rental, RentalFilter, RentalId, 
    EntityClient, EntityLogic, EntityPaginationData, EntityPaginationFilter 
} from '@rsoi-lab2/library';

import { ConfigurableLogic, LogicOptions } from './interface';
import { getClientOptsFromLogicOptions } from './helpers';

export class RentalsLogic implements 
    EntityLogic<Required<Rental>, RentalFilter, RentalId>,
    ConfigurableLogic<RentalsLogic>
{
    constructor(client: EntityClient<Rental, RentalFilter, RentalId>) {
        this.client = client;
    }

    getIdType(): 'string' | 'number' {
        return 'string';
    }

    withOptions(options: LogicOptions): ConfigurableLogic<RentalsLogic> {
        return new RentalsLogic(
            this.client.withOpts(getClientOptsFromLogicOptions(options))
        );
    }

    getOne(id: RentalId): Promise<Required<Rental> | null> {
        this.validateId(id);

        return this.client.getOne(id);
    }

    getMany(filter: RentalFilter): Promise<Array<Required<Rental>>> {
        return this.client.getMany(filter);
    }

    getPaginatedMany(_: RentalFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Rental>>> {
        throw new Error('RentalsLogic does not support paginated getPaginatedMany(), use getMany() instead');
    }

    create(entity: Required<Rental>): Promise<Required<Rental>> {
        return this.client.create(entity);
    }

    update(id: RentalId, update: Partial<Rental>): Promise<Required<Rental>> {
        this.validateId(id);

        return this.client.update(id, update);
    }

    delete(id: RentalId): Promise<boolean> {
        this.validateId(id);

        return this.client.delete(id);
    }

    supportsPagination(): boolean {
        return false;
    }

    validateId(value: RentalId): void {
        if (value.length === 0) {
            throw new Error('id must not be an empty string');
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

    private client: EntityClient<Required<Rental>, RentalFilter, RentalId>;
}
