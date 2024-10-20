import { PostgresEntityMapper, EntityPaginationFilter, EntityPaginationData } from "@rsoi-lab2/library";
import { Payment, PaymentFilter, PaymentId } from "../logic";

export class PostgresPaymentMapper extends PostgresEntityMapper<Payment, PaymentFilter, PaymentId> {
    constructor(tableName: string) {
        super(tableName, 0);
    }

    getInsertQueryForEntity(entity: Payment): [string, unknown[], unknown[]] {
        return [
            `INSERT INTO %I
            (payment_uid, status, pricae)
            VALUES($1::UUID, $2::TEXT, $3::INTEGER)
            RETURNING *;`,
            [this.getTableName()],
            [
                entity.paymentUid,
                entity.status,
                entity.price
            ]
        ];
    }

    getUpdateQueryForEntity(_: any): [string, unknown[], unknown[]] {
        // TODO
        return ['SELECT 1;', [], []];
    }

    getSelectQueryForFilter(filter: PaymentFilter): [string, unknown[], unknown[]] {
        return ['SELECT * FROM %I WHERE availability = TRUE ORDER BY payment_uid',
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

    getEntityFromRow(row: Record<string, unknown>): Payment {
        for(const key of ['id', 'payment_uid', 'status', 'price']) {
            if (!row.hasOwnProperty(key)) {
                throw new Error(`Payment row misses key: ${key}`);
            }
        }

        return {
            id: <Payment['id']>row.id,
            paymentUid: <Payment['paymentUid']>row.payment_uid,
            status: <Payment['status']>row.status,
            price: <Payment['price']>row.price
        };
    }

    getPaginatedEntities(
        _: Array<Record<string, unknown>>, 
        __: EntityPaginationFilter, 
        ___: Record<string, unknown>
    ) {
        throw new Error(`getPaginatedEntities() is not implemented in PostgresPaymentMapper`);
    }
}
