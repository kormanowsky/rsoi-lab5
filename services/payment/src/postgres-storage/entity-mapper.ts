import { PostgresEntityMapper, EntityPaginationFilter, EntityPaginationData } from "@rsoi-lab2/library";
import { Payment, PaymentFilter, PaymentId } from "../logic";

export class PostgresPaymentMapper extends PostgresEntityMapper<Payment, PaymentFilter, PaymentId> {
    constructor(tableName: string) {
        super(tableName, 'payment_uid', '00000000-0000-0000-0000-000000000001');
    }

    getEntityPropsToColumnsMap(): Record<keyof Payment, [string | true, string]> {
        return {
            id: [true, 'INTEGER'],
            paymentUid: ['payment_uid', 'UUID'],
            price: [true, 'INTEGER'],
            status: [true, 'TEXT']
        };
    }

    getSelectQueryForFilter(_: PaymentFilter): [string, unknown[], unknown[]] {
        return ['SELECT * FROM %I ORDER BY payment_uid',
            [this.getTableName()], 
            []
        ];
    }

    getPaginatedSelectQueryForFilter(_: PaymentFilter): [string, unknown[], unknown[]] {
        throw new Error(`getPaginatedSelectQueryForFilter() is not implemented in PostgresPaymentMapper`);
    }

    getSelectTotalCountQueryForFilter(_: PaymentFilter): [string, unknown[], unknown[]] {
        throw new Error(`getSelectTotalCountQueryForFilter() is not implemented in PostgresPaymentMapper`);
    }
}
