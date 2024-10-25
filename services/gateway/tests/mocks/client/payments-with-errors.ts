import { Payment, PaymentFilter, PaymentId } from "@rsoi-lab2/library";
import { MockPaymentsClient } from "./payments";

export class MockPaymentsWithErrorsClient extends MockPaymentsClient {
    getOne(_: PaymentId): Promise<Required<Payment> | null> {
        throw new Error('errored');
    }

    getMany(_: PaymentFilter): Promise<Array<Required<Payment>>> {
        throw new Error('errored');
    }

    create(_: Payment): Promise<Required<Payment>> {
        throw new Error('errored');
    }

    update(_: PaymentId, __: Partial<Payment>): Promise<Required<Payment>> {
        throw new Error('errored');
    }

    delete(_: PaymentId): Promise<boolean> {
        throw new Error('errored');
    }

    getIdType(): "string" | "number" {
        return 'string';
    }
}