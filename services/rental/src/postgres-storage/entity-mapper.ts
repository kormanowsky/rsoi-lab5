import { PostgresEntityMapper, EntityPaginationFilter, EntityPaginationData } from "@rsoi-lab2/library";
import { Rental, RentalFilter, RentalId } from "../logic";

export class PostgresRentalMapper extends PostgresEntityMapper<Rental, RentalFilter, RentalId> {
    constructor(tableName: string) {
        super(tableName, 0);
    }

    getInsertQueryForEntity(entity: Rental): [string, unknown[], unknown[]] {
        return [
            `INSERT INTO %I
            (rental_uid, username, payment_uid, car_uid, date_from, date_to, status)
            VALUES($1::UUID, $2::TEXT, $3::UUID, $4::UUID, $5::DATETIME, $6::DATETIME, $7::TEXT)
            RETURNING *;`,
            [this.getTableName()],
            [
                entity.rentalUid,
                entity.username,
                entity.paymentUid,
                entity.carUid,
                entity.dateFrom,
                entity.dateTo,
                entity.status
            ]
        ];
    }

    getUpdateQueryForEntity(_: any): [string, unknown[], unknown[]] {
        // TODO
        return ['SELECT 1;', [], []];
    }

    getSelectQueryForFilter(filter: RentalFilter): [string, unknown[], unknown[]] {
        return ['SELECT * FROM %I WHERE username = $1::TEXT ORDER BY rental_uid',
            [this.getTableName()], 
            [filter.username]
        ];
    }

    getPaginatedSelectQueryForFilter(_: RentalFilter): [string, unknown[], unknown[]] {
        throw new Error(`getPaginatedSelectQueryForFilter() is not implemented in PostgresRentalMapper`);
    }

    getSelectTotalCountQueryForFilter(_: RentalFilter): [string, unknown[], unknown[]] {
        throw new Error(`getSelectTotalCountQueryForFilter() is not implemented in PostgresRentalMapper`);
    }

    getEntityFromRow(row: Record<string, unknown>): Rental {
        for(const key of [
            'id', 'rental_uid', 'username', 'payment_uid', 'car_uid', 'date_from', 'date_to', 'status'
        ]) {
            if (!row.hasOwnProperty(key)) {
                throw new Error(`Rental row misses key: ${key}`);
            }
        }

        return {
            id: <Rental['id']>row.id,
            rentalUid: <Rental['rentalUid']>row.rental_uid,
            username: <Rental['username']>row.username,
            paymentUid: <Rental['paymentUid']>row.payment_uid,
            carUid: <Rental['carUid']>row.car_uid,
            dateFrom: <Rental['dateFrom']>row.date_from,
            dateTo: <Rental['dateTo']>row.date_to,
            status: <Rental['status']>row.status
        };
    }

    getPaginatedEntities(
        _: Array<Record<string, unknown>>, 
        __: EntityPaginationFilter, 
        ___: Record<string, unknown>
    ) {
        throw new Error(`getPaginatedEntities() is not implemented in PostgresRentalMapper`);
    }
}
