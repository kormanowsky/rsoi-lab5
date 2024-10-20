import { EntityPaginationFilter, EntityServer } from '@rsoi-lab2/library';

import { Car, CarFilter, CarId } from '../logic';

export class CarsServer extends EntityServer<Car, CarFilter, CarId> {
    parseEntity(value: unknown): Car {
        // TODO: 
        return <Car>value;
    }

    parsePartialEntity(value: unknown): Partial<Car> {
        // TODO: 
        return <Car>value;
    }

    parseFilter(value: unknown): CarFilter {
        if (typeof value !== 'object' || value == null) {
            throw new Error(`Bad Filter: must be non-nullish object`);
        }

        const valueAsRecord = <Record<string, string>>value;

        const filter: CarFilter = {
            page: 1,
            size: 10,
            showAll: false
        };

        if (valueAsRecord.hasOwnProperty('showAll')) {
            if (valueAsRecord.showAll === 'false') {
                valueAsRecord.showAll = '0';
            }

            filter.showAll = Boolean(valueAsRecord.showAll);
        }

        if (valueAsRecord.hasOwnProperty('page')) {
            if (!valueAsRecord.hasOwnProperty('size')) {
                throw new Error(`Bad Filter: specify both page and size or do not specity them at all`);
            }
        } else if (valueAsRecord.hasOwnProperty('size')) {
            throw new Error(`Bad Filter: specify both page and size or do not specity them at all`);
        }

        let 
            pageAsInt = parseInt(valueAsRecord.page, 10),
            sizeAsInt = parseInt(valueAsRecord.size, 10);

        if (isNaN(pageAsInt) || isNaN(sizeAsInt) || pageAsInt <= 0 || sizeAsInt <= 0) {
            throw new Error('Bad Filter: page and size must be ints >= 1'); 
        }

        filter.page = pageAsInt;
        filter.size = sizeAsInt;
        
        return filter;
    }

    parsePaginationFilter(value: unknown): CarFilter & EntityPaginationFilter {
        return this.parseFilter(value);
    }
}