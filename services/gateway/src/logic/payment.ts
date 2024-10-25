import { 
    Payment, PaymentFilter, PaymentId, 
    EntityClient, EntityLogic, EntityPaginationData, EntityPaginationFilter 
} from '@rsoi-lab2/library';

export class PaymentsLogic implements EntityLogic<Required<Payment>, PaymentFilter, PaymentId> {
    constructor(client: EntityClient<Required<Payment>, PaymentFilter, PaymentId>) {
        this.client = client;
    }

    getIdType(): 'string' | 'number' {
        return 'string';
    }

    getOne(id: PaymentId): Promise<Required<Payment> | null> {
        this.validateId(id);

        return this.client.getOne(id);
    }

    getMany(filter: PaymentFilter): Promise<Array<Required<Payment>>> {
        return this.client.getMany(filter);
    }

    getPaginatedMany(_: PaymentFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Payment>>> {
        throw new Error('PaymentsLogic does not support paginated getPaginatedMany(), use getMany() instead');
    }

    create(entity: Required<Payment>): Promise<Required<Payment>> {
        return this.client.create(entity);
    }

    update(id: PaymentId, update: Partial<Payment>): Promise<Required<Payment>> {
        this.validateId(id);

        return this.client.update(id, update);
    }

    delete(id: PaymentId): Promise<boolean> {
        this.validateId(id);

        return this.client.delete(id);
    }

    supportsPagination(): boolean {
        return true;
    }

    validateId(value: PaymentId): void {
        if (value.length === 0) {
            throw new Error('id must not be an empty string');
        }
    }

    validateEntity(value: Payment): void {
        for(const key of [
            'status', 'price'
        ]) {
            if (!value.hasOwnProperty(key)) {
                throw new Error(`Invalid payment: has no ${key} field value`);
            }
        }

        this.validatePartialEntity(value);
    }

    validateFilter(value: PaymentFilter): void {
        // Пока нет фильтров для оплат
        return;
    }

    validatePartialEntity(value: Partial<Payment>): void {
        if (
            value.hasOwnProperty('status') && 
            !['PAID', 'CANCELED'].includes(value.status!)
        ) {
            throw new Error('Invalid payment: invalid status');
        }

        if (value.hasOwnProperty('price') && value.price! <= 0) {
            throw new Error('Invalid payment: price must be positive');
        }
    }

    private client: EntityClient<Required<Payment>, PaymentFilter, PaymentId>;
}
