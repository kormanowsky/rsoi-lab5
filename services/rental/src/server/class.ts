import { EntityPaginationFilter, EntityServer } from '@rsoi-lab2/library';
import { Rental, RentalFilter, RentalId } from '../logic';

export class RentalServer extends EntityServer<Rental, RentalFilter, RentalId> {
    parseEntity(value: unknown): Rental {
        const partialRental = this.parsePartialEntity(value);

        for(const key of ['carUid', 'paymentUid', 'username', 'dateFrom', 'dateTo']) {
            if (!partialRental.hasOwnProperty(key)) {
                throw new Error(`Invalid rental: must contain value in ${key} key`);
            }
        }

        return <Rental>partialRental;
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
        if (typeof value !== 'object' || value == null) {
            throw new Error('Invalid rental: must be non-nullish object');
        }

        for(const key of ['carUid', 'paymentUid', 'username']) {
            if (value.hasOwnProperty(key) && typeof value[key] !== 'string') {
                throw new Error(`Invalid rental: must contain string in key ${key}`);
            }
        }

        for(const key of ['dateFrom', 'dateTo']) {
            if (value.hasOwnProperty(key)) {
                const dateFromKey = new Date(value[key]); 

                if (isNaN(dateFromKey.getTime())) {
                    throw new Error(`Invalid rental: must contain valid date in key ${key}`);
                }

                value[key] = dateFromKey;
            }
        }

        return <Partial<Rental>>value;
    }
}