import { EntityPaginationFilter, EntityServer } from '@rsoi-lab2/library';
import { Payment, PaymentFilter, PaymentId } from '../logic';

export class PaymentServer extends EntityServer<Payment, PaymentFilter, PaymentId> {
    parseEntity(value: unknown): Payment {
        // TODO:
        return <Payment>value;
    }

    parseFilter(value: unknown): PaymentFilter {
        return {};
    }

    parsePaginationFilter(value: unknown): PaymentFilter & EntityPaginationFilter {
        throw new Error('parsePaginationFilter() is not implemented in PaymentServer');
    }

    parsePartialEntity(value: unknown): Partial<Payment> {
        // TODO:
        return <Payment>value;
    }
}