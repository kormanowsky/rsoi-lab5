import { EntityPaginationFilter, EntityServer } from '@rsoi-lab2/library';
import { Rental, RentalFilter, RentalId } from '../logic';

export class RentalServer extends EntityServer<Rental, RentalFilter, RentalId> {
    parseEntity(value: unknown): Rental {
        // TODO:
        return <Rental>value;
    }

    parseFilter(value: unknown): RentalFilter {
        if (typeof value !== 'object' || value == null) {
            throw new Error('Rental filter must be non-nullish object');
        }

        const valueAsRecord = <Record<string, string>>value;

        if (valueAsRecord.hasOwnProperty('username')) {
            if (typeof valueAsRecord.username !== 'string' || valueAsRecord.username.length === 0) {
                throw new Error('Rental filter must contain username');
            }

            return {username: valueAsRecord.username};
        }

        throw new Error('Rental filter must contain username');
    }

    parsePaginationFilter(value: unknown): RentalFilter & EntityPaginationFilter {
        throw new Error('parsePaginationFilter() is not implemented in RentalServer');
    }

    parsePartialEntity(value: unknown): Partial<Rental> {
        // TODO:
        return <Rental>value;
    }
}