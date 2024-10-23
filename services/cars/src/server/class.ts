import { EntityPaginationFilter, EntityServer } from '@rsoi-lab2/library';

import { Car, CarFilter, CarId } from '../logic';

export class CarsServer extends EntityServer<Car, CarFilter, CarId> {
    parseEntity(value: unknown): Car {
        const partialCar = this.parsePartialEntity(value);

        for(const key of [
            'brand', 'model', 'registrationNumber', 
            'price', 'power', 'type', 'available'
        ]) {
            if (!partialCar.hasOwnProperty(key)) {
                throw new Error(`Invalid car: has no ${key} field value`);
            }
        }

        return <Car>partialCar;
    }

    parsePartialEntity(value: unknown): Partial<Car> {
        if (typeof value !== 'object' || value == null) {
            throw new Error('Invalid car: must be non-nullish object');
        }

        for(const key of ['carUid', 'brand', 'model', 'registrationNumber']) {
            if (
                value.hasOwnProperty(key) && 
                (typeof value[key] !== 'string')
            ) {
                throw new Error(`Invalid car: has empty or non-string ${key}`);
            }
        }

        for(const key of ['price', 'power']) {
            if (
                value.hasOwnProperty(key) && 
                (typeof value[key] !== 'number' || isNaN(value[key]))
            ) {
                throw new Error(`Invalid car: has non-positive ${key}`);
            }
        }

        if (value.hasOwnProperty('type') && typeof value['type'] !== 'string') {
            throw new Error(`Invalid car: has invalid type`);
        }
        
        if (value.hasOwnProperty('available') && typeof value['available'] !== 'boolean') {
            throw new Error(`Invalid car: has invalid available field value`);
        }

        return <Partial<Car>>value;
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
                valueAsRecord.showAll = '';
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

        if (isNaN(pageAsInt) || isNaN(sizeAsInt)) {
            throw new Error('Bad Filter: page and size must be ints'); 
        }

        filter.page = pageAsInt;
        filter.size = sizeAsInt;
        
        return filter;
    }

    parsePaginationFilter(value: unknown): CarFilter & EntityPaginationFilter {
        return this.parseFilter(value);
    }
}