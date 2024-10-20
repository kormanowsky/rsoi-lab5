import { PostgresEntityMapper, EntityPaginationFilter, EntityPaginationData } from "@rsoi-lab2/library";
import { Rental, RentalFilter, RentalId } from "../logic";

export class PostgresRentalMapper extends PostgresEntityMapper<Rental, RentalFilter, RentalId> {
    constructor(tableName: string) {
        super(tableName, 'rental_uid', '00000000-0000-0000-0000-000000000001');
    }

    getEntityPropsToColumnsMap(): Record<keyof Rental, [string | true, string]> {
        return {
            id: [true, 'INTEGER'],
            rentalUid: ['rental_uid', 'UUID'],
            paymentUid: ['payment_uid', 'UUID'],
            carUid: ['car_uid', 'UUID'],
            dateFrom: ['date_from', 'DATE'],
            dateTo: ['date_to', 'DATE'],
            status: [true, 'TEXT'],
            username: [true, 'TEXT']
        };
    }

    getInsertQueryForEntity(entity: Rental): [string, unknown[], unknown[]] {
        let uidValue = '';

        if (entity.rentalUid == null) {
            uidValue = 'gen_random_uuid()'
        } else {
            uidValue = '$7::UUID';
        }

        return [
            `INSERT INTO %I
            (username, payment_uid, car_uid, date_from, date_to, status, rental_uid)
            VALUES($1::TEXT, $2::UUID, $3::UUID, $4::DATE, $5::DATE, $6::TEXT, ${uidValue})
            RETURNING *;`,
            [this.getTableName()],
            [
                entity.username,
                entity.paymentUid,
                entity.carUid,
                entity.dateFrom,
                entity.dateTo,
                entity.status,
                ...(entity.rentalUid == null ? [] : [entity.rentalUid])
            ]
        ];
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

    getPaginatedEntities(
        _: Array<Record<string, unknown>>, 
        __: EntityPaginationFilter, 
        ___: Record<string, unknown>
    ) {
        throw new Error(`getPaginatedEntities() is not implemented in PostgresRentalMapper`);
    }
}
