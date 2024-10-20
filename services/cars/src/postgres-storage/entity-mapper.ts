import { PostgresEntityMapper, EntityPaginationFilter, EntityPaginationData } from "@rsoi-lab2/library";
import { Car, CarFilter, CarId } from "../logic";

export class PostgresCarMapper extends PostgresEntityMapper<Car, CarFilter, CarId> {
    constructor(tableName: string) {
        super(tableName, 0);
    }

    getInsertQueryForEntity(entity: Car): [string, unknown[], unknown[]] {
        return [
            `INSERT INTO %I
            (car_uid, brand, model, registration_number, power, price, type, availablity)
            VALUES($1::UUID, $2::TEXT, $3::TEXT, $4::TEXT, $5::INTEGER, $6::INTEGER, $7::TEXT, $8::BOOLEAN)
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
                entity.availability
            ]
        ];
    }

    getUpdateQueryForEntity(entity: Partial<Car>): [string, unknown[], unknown[]] {
        // TODO
        return ['SELECT 1;', [], []];
    }

    getSelectQueryForFilter(filter: CarFilter): [string, unknown[], unknown[]] {
        if (filter.showAll) {
            return [
                `SELECT * FROM %I ORDER BY car_uid LIMIT $1::INTEGER OFFSET $2::INTEGER;`,
                [this.getTableName()], 
                [filter.size, filter.page]
            ];
        }

        return [
            `SELECT * FROM %I WHERE availability = TRUE ORDER BY car_uid 
            LIMIT $1::INTEGER OFFSET $2::INTEGER;`,
            [this.getTableName()], 
            [filter.size, filter.page]
        ];
    }

    getPaginatedSelectQueryForFilter(filter: CarFilter & EntityPaginationFilter): [string, unknown[], unknown[]] {
        return this.getSelectQueryForFilter(filter);
    }

    getSelectTotalCountQueryForFilter(filter: CarFilter): [string, unknown[], unknown[]] {
        const 
            [selectQuery, formatParams, queryParams] = this.getSelectQueryForFilter(filter),
            unlimitedSelectQuery = selectQuery.replace(/ORDER BY.+;/, '');
        
        return [
            `WITH filtered_items AS (${unlimitedSelectQuery})
            SELECT COUNT(*) AS total_count FROM filtered_items;`,
            formatParams,
            queryParams.slice(0, -2),
        ];
    }

    getEntityFromRow(row: Record<string, unknown>): Car {
        for(const key of [
            'id', 'car_uid', 'brand', 
            'model', 'registration_number', 
            'power', 'price', 'type', 'availability'
        ]) {
            if (!row.hasOwnProperty(key)) {
                throw new Error(`Car row misses key: ${key}`);
            }
        }

        return {
            id: <Car['id']>row.id,
            carUid: <Car['carUid']>row.car_uid,
            brand: <Car['brand']>row.brand,
            model: <Car['model']>row.model,
            registrationNumber: <Car['registrationNumber']>row.registration_number,
            power: <Car['power']>row.power,
            price: <Car['price']>row.price,
            type: <Car['type']>row.type, 
            availability: <Car['availability']>row.availability
        };
    }

    getPaginatedEntities(
        entityRows: Array<Record<string, unknown>>, 
        filter: EntityPaginationFilter, 
        totalCountRow: Record<string, unknown>
    ) {
        return {
            items: entityRows.map((row) => this.getEntityFromRow(row)),
            totalElements: totalCountRow.total_count,
            page: filter.page,
            pageSize: filter.size
        };
    }
}
