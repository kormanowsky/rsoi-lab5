import { EntityLogic, EntityPaginationData, EntityPaginationFilter, EntityStorage } from "@rsoi-lab2/library";
import { Payment, PaymentFilter, PaymentId } from "./interface";

export class PaymentsLogic implements EntityLogic<Payment, PaymentFilter, PaymentId> {
    constructor(storage: EntityStorage<Payment, PaymentFilter, PaymentId>) {
        this.storage = storage;
    }

    getIdType(): "string" | "number" {
        return this.storage.getIdType();
    }

    async getOne(id: PaymentId): Promise<Payment | null> {
        this.validateId(id);

        return this.storage.getOne(id);
    }

    async getMany(filter: PaymentFilter): Promise<Payment[]> {
        this.validateFilter(filter);

        return this.storage.getMany(filter);
    }

    supportsPagination(): boolean {
        return this.storage.supportsPagination();
    }

    async getPaginatedMany(filter: PaymentFilter & EntityPaginationFilter): Promise<EntityPaginationData<Payment>> {
        this.validateFilter(filter);

        return this.storage.getPaginatedMany(filter);
    }

    async create(entity: Payment): Promise<Payment> {
        this.validateEntity(entity);

        return this.storage.create(entity);
    }

    async update(id: PaymentId, update: Partial<Payment>): Promise<Payment> {
        this.validateId(id);
        this.validatePartialEntity(update);

        return this.storage.update(id, update);
    }

    async delete(id: PaymentId): Promise<boolean> {
        this.validateId(id);

        return this.storage.delete(id);
    }

    validateId(id: PaymentId): void {
        if (id.length === 0) {
            throw new Error(`Invalid payment id: ${id}`);
        }
    }

    validateEntity(value: Payment): void {
        // TODO:
        return;
    }

    validateFilter(value: PaymentFilter): void {
        // TODO:
        return;
    }

    validatePartialEntity(value: Partial<Payment>): void {
        // TODO:
        return;
    }

    private storage: EntityStorage<Payment, PaymentFilter, PaymentId>;
}
