import { PostgresEntityMapper } from "@rsoi-lab2/library";
import { Car, CarFilter, CarId } from "../logic";

export class PostgresCarMapper extends PostgresEntityMapper<Car, CarFilter, CarId> {
    constructor(tableName: string) {
        super(tableName, 0);
    }

    getInsertQueryForEntity(entity: Car): [string, unknown[]] {
        return [
            `INSERT INTO $1::TEXT
            (car_uid, brand, model, registration_number, power, price, type, availablity)
            VALUES($2::UUID, $3::TEXT, $4::TEXT, $5::TEXT, $6::INTEGER, $7::INTEGER, $8::TEXT, $9::BOOLEAN)
            RETURNING *;`,
            [
                this.getTableName(), 
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

    getUpdateQueryForEntity(entity: Partial<Car>): [string, unknown[]] {
        // TODO
        return ['SELECT 1;', []];
    }

    getSelectQueryForFilter(filter: CarFilter): [string, unknown[]] {
        if (filter.showAll) {
            return [
                `SELECT * FROM $1::TEXT ORDER BY car_uid LIMIT $2::INTEGER OFFSET $3::INTEGER;`,
                [this.getTableName(), filter.size, filter.page]
            ];
        }

        return [
            `SELECT * FROM $1::TEXT WHERE availability = TRUE ORDER BY car_uid 
            LIMIT $2::INTEGER OFFSET $3::INTEGER;`,
            [this.getTableName(), filter.size, filter.page]
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
}