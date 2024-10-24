import { 
    Payment, PaymentFilter, PaymentId, 
    EntityStorage, EntityPaginationFilter, EntityPaginationData 
} from "@rsoi-lab2/library";

export class MockPaymentsStorage implements EntityStorage<Payment, PaymentFilter, PaymentId> {
    constructor(initialData: Array<Required<Payment>> = []) {
        this.storage = {};

        for(const payment of initialData) {
            this.storage[payment.paymentUid] = payment;
        }
    }

    async getOne(id: PaymentId): Promise<Payment | null> {
        return this.storage[id] ?? null;
    }

    async getMany(_: PaymentFilter): Promise<Payment[]> {
        return Object.values(this.storage).filter((payment): payment is Payment => payment != null);
    }

    async getPaginatedMany(_: PaymentFilter & EntityPaginationFilter): Promise<EntityPaginationData<Payment>> {
        throw new Error('Pagination is not supported on payments!');
    }

    supportsPagination(): boolean {
        return false;
    }

    getIdType(): "string" | "number" {
        return "string";
    }

    async create(entity: Payment): Promise<Payment> {
        const preparedEntity = {
            ...entity,
            id: this.id,
            paymentUid: `Payment-uid-${this.id}`
        };
        this.id++;
        this.storage[preparedEntity.paymentUid] = preparedEntity;
        return preparedEntity;
    }

    async update(id: PaymentId, update: Partial<Payment>): Promise<Payment> {
        if (this.storage.hasOwnProperty(id)) {
            return Object.assign(this.storage[id]!, update);
        }

        throw new Error(`Update failed: id = ${id} does not exist`);
    }

    async delete(id: PaymentId): Promise<boolean> {
        delete this.storage[id];
        return true;
    }

    private storage: Partial<Record<PaymentId, Payment>>;
    private id: number = 0;
}