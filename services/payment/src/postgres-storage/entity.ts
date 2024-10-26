import { PostgresEntityStorage } from '@rsoi-lab2/library';
import { Payment, PaymentFilter, PaymentId } from '../logic';

export class PostgresPaymentsStorage extends PostgresEntityStorage<Payment, PaymentFilter, PaymentId>{
    supportsPagination(): boolean {
        return false;
    }
}