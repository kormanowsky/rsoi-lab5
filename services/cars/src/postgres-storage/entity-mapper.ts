import { PostgresEntityMapper, EntityPaginationFilter, EntityPaginationData } from "@rsoi-lab2/library";
import { Car, CarFilter, CarId } from "../logic";

export class PostgresCarMapper extends PostgresEntityMapper<Car, CarFilter, CarId> {
    constructor(tableName: string) {
        super(tableName, 'car_uid', '00000000-0000-0000-0000-000000000001');
    }

    getInsertQueryForEntity(entity: Car): [string, unknown[], unknown[]] {
        let uidValue = '';

        if (entity.carUid == null) {
            uidValue = 'gen_random_uuid()'
        } else {
            uidValue = '$8::UUID';
        }

        return [
            `INSERT INTO %I
            (brand, model, registration_number, power, price, type, availablity, car_uid)
            VALUES($1::TEXT, $2::TEXT, $3::TEXT, $4::INTEGER, $5::INTEGER, $6::TEXT, $7::BOOLEAN, ${uidValue})
            RETURNING *;`,
            [this.getTableName()],
            [
                entity.carUid,
                entity.brand, 
                entity.model,
                entity.registrationNumber,
                entity.power,
                entity.price,
                entity.type,
                entity.available,
                ...(entity.carUid == null ? [] : [entity.carUid])
            ]
        ];
    }

    getEntityPropsToColumnsMap(): Record<keyof Car, [string | true, string]> {
        return {
            id: [true, 'INTEGER'],
            carUid: ['car_uid', 'UUID'],
            available: ['availability', 'BOOLEAN'],
            brand: [true, 'TEXT'],
            model: [true, 'TEXT'],
            registrationNumber: ['registration_number', 'TEXT'],
            price: [true, 'INTEGER'],
            power: [true, 'INTEGER'],
            type: [true, 'TEXT']
        };
    }

    getSelectQueryForFilter(filter: CarFilter): [string, unknown[], unknown[]] {
        if (filter.showAll) {
            return [
                `SELECT * FROM %I ORDER BY car_uid LIMIT $1::INTEGER OFFSET $2::INTEGER;`,
                [this.getTableName()], 
                [filter.size, (filter.page - 1) * filter.size]
            ];
        }

        return [
            `SELECT * FROM %I WHERE availability = TRUE ORDER BY car_uid 
            LIMIT $1::INTEGER OFFSET $2::INTEGER;`,
            [this.getTableName()], 
            [filter.size, (filter.page - 1) * filter.size]
        ];
    }

    getPaginatedSelectQueryForFilter(filter: CarFilter & EntityPaginationFilter): [string, unknown[], unknown[]] {
        return this.getSelectQueryForFilter(filter);
    }

    getSelectTotalCountQueryForFilter(filter: CarFilter): [string, unknown[], unknown[]] {
        const 
            [selectQuery, formatParams, queryParams] = this.getSelectQueryForFilter(filter),
            unlimitedSelectQuery = selectQuery.replace(/ORDER BY[^;]+;/m, '');
        
        return [
            `WITH filtered_items AS (${unlimitedSelectQuery})
            SELECT COUNT(*) AS total_count FROM filtered_items;`,
            formatParams,
            queryParams.slice(0, -2),
        ];
    }

    getPaginatedEntities(
        entityRows: Array<Record<string, unknown>>, 
        filter: EntityPaginationFilter, 
        totalCountRow: Record<string, unknown>
    ): EntityPaginationData<Car> {
        return {
            items: entityRows.map((row) => this.getEntityFromRow(row)),
            totalElements: parseInt(<string>totalCountRow.total_count, 10),
            page: filter.page,
            pageSize: filter.size
        };
    }
}
