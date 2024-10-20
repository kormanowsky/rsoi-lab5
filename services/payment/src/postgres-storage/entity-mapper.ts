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

    getInsertQueryForEntity(entity: Payment): [string, unknown[], unknown[]] {
        if (entity.paymentUid == null) {
            return [
                `INSERT INTO %I
                (payment_uid, status, price)
                VALUES(gen_random_uuid(), $1::TEXT, $2::INTEGER)
                RETURNING *;`,
                [this.getTableName()],
                [
                    entity.status,
                    entity.price
                ]
            ];
        }

        return [
            `INSERT INTO %I
            (payment_uid, status, price)
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

    getPaginatedEntities(
        _: Array<Record<string, unknown>>, 
        __: EntityPaginationFilter, 
        ___: Record<string, unknown>
    ) {
        throw new Error(`getPaginatedEntities() is not implemented in PostgresPaymentMapper`);
    }
}
