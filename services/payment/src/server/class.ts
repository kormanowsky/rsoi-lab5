import { EntityPaginationFilter, EntityServer } from '@rsoi-lab2/library';

import { Payment, PaymentFilter, PaymentId } from '../logic';

export class PaymentServer extends EntityServer<Payment, PaymentFilter, PaymentId> {
    parseEntity(value: unknown): Payment {
        const parialPayment = this.parsePartialEntity(value);

        for(const key of ['status', 'price']) {
            if (!parialPayment.hasOwnProperty(key)) {
                throw new Error(`Invalid payment: must contain ${key} key`);
            }
        }

        return <Payment>parialPayment;
    }

    parseFilter(value: unknown): PaymentFilter {
        return {};
    }

    parsePaginationFilter(value: unknown): PaymentFilter & EntityPaginationFilter {
        throw new Error('parsePaginationFilter() is not implemented in PaymentServer');
    }

    parsePartialEntity(value: unknown): Partial<Payment> {
        if (typeof value !== 'object' || value == null) {
            throw new Error('Invalid payment: must be a non-nullish object');
        }

        if (value.hasOwnProperty('status') && typeof value['status'] !== 'string') {
            throw new Error('Invalid payment: status must be a string');
        }

        if (
            value.hasOwnProperty('price') && 
            (typeof value['price'] !== 'number' || isNaN(value['price']))
        ) {
            throw new Error('Invalid payment: price must be positive');
        }

        return <Partial<Payment>>value;
    }
}