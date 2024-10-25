import { 
    Payment, PaymentFilter, PaymentId, 
    EntityPaginationFilter, EntityPaginationData, 
    EntityClient
} from '@rsoi-lab2/library';

export class MockPaymentsClient extends EntityClient<Payment, PaymentFilter, PaymentId> {
    constructor(initialData: Array<Required<Payment>> = []) {
        super('');
        this.storage = {};

        for(const payment of initialData) {
            this.storage[payment.paymentUid] = payment;
        }
    }

    async getOne(id: PaymentId): Promise<Required<Payment> | null> {
        return this.storage[id] ?? null;
    }

    async getMany(_: PaymentFilter): Promise<Array<Required<Payment>>> {
        return Object.values(this.storage).filter((payment): payment is Required<Payment> => payment != null);
    }

    async getPaginatedMany(_: PaymentFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<Payment>>> {
        throw new Error('Pagination is not supported on payments!');
    }

    supportsPagination(): boolean {
        return false;
    }

    getIdType(): 'string' | 'number' {
        return 'string';
    }

    async create(entity: Payment): Promise<Required<Payment>> {
        const preparedEntity = {
            ...entity,
            id: this.id,
            paymentUid: `Payment-uid-${this.id}`
        };
        this.id++;
        this.storage[preparedEntity.paymentUid] = preparedEntity;
        return preparedEntity;
    }

    async update(id: PaymentId, update: Partial<Payment>): Promise<Required<Payment>> {
        if (this.storage.hasOwnProperty(id)) {
            return Object.assign(this.storage[id]!, update);
        }

        throw new Error(`Update failed: id = ${id} does not exist`);
    }

    async delete(id: PaymentId): Promise<boolean> {
        delete this.storage[id];
        return true;
    }

    private storage: Partial<Record<PaymentId, Required<Payment>>>;
    private id: number = 0;
}