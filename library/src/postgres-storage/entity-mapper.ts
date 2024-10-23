import { EntityPaginationData, EntityPaginationFilter } from "../logic";

export abstract class PostgresEntityMapper<TEnt, TEntFilter, TId extends string | number = string> {
    constructor(tableName: string, idColumnName: string, sampleId: TId) {
        this.tableName = tableName;
        this.idColumnName = idColumnName;
        this.sampleId = sampleId;
    }

    abstract getEntityPropsToColumnsMap(): Record<keyof TEnt, [string | true, string]>;

    abstract getSelectQueryForFilter(filter: TEntFilter): [string, unknown[], unknown[]];
    abstract getPaginatedSelectQueryForFilter(filter: TEntFilter & EntityPaginationFilter): [string, unknown[], unknown[]];
    abstract getSelectTotalCountQueryForFilter(filter: TEntFilter): [string, unknown[], unknown[]];

    getSelectQueryForId(id: TId): [string, unknown[], unknown[]] {
        if (typeof id === 'string') {
            return [
                `SELECT * FROM %I WHERE %I = $1::UUID`, 
                [this.getTableName(), this.getIdColumnName()], 
                [id]
            ];
        }

        return [
            `SELECT * FROM %I WHERE %I = $1::INTEGER`,
            [this.getTableName(), this.getIdColumnName()], 
            [id]
        ];
    }

    getInsertQueryForEntity(entity: TEnt): [string, unknown[], unknown[]] {
        const 
            columns: string[] = [],
            placeholders: string[] = [],
            values: unknown[] = [],
            entityAsMap = <{[K in keyof TEnt]: TEnt[K]}>entity;
        
        for(const [key, [rowKey, rowValueType]] of Object.entries<[string | true, string]>(this.getEntityPropsToColumnsMap())) {
            const columnName = rowKey === true ? key : rowKey;
            
            if (entityAsMap.hasOwnProperty(key)) {
                columns.push(columnName);
                placeholders.push(`$${values.length + 1}::${rowValueType}`)
                values.push(entity[key]);
            } else if (columnName === this.getIdColumnName() && typeof this.getSampleId() === 'string') {
                columns.push(columnName);
                placeholders.push('gen_random_uuid()');
            }
        }

        return [
            `INSERT INTO %I (${columns.join(',')}) VALUES(${placeholders.join(',')}) RETURNING *`,
            [this.getTableName()],
            values
        ];
    }

    getUpdateQueryForEntity(entity: {id: TId, update: Partial<TEnt>}): [string, unknown[], unknown[]] {
        const 
            {id, update} = entity,
            setClauses: Array<[string, string]> = [],
            setValues: unknown[] = [];

        if (Object.keys(update).length === 0) {
            throw new Error('Empty update');
        }

        for(const [key, [rowKey, rowValueType]] of Object.entries<[string | true, string]>(this.getEntityPropsToColumnsMap())) {
            if (update.hasOwnProperty(key)) {
                setClauses.push([rowKey === true ? key : rowKey, rowValueType]);
                setValues.push(update[key]);
            }
        }

        const mergedSetClause = setClauses.map(([key, type], idx) => `${key} = $${idx + 1}::${type}`).join(', ');

        let whereValueType = '';

        if (typeof id === 'string') {
            whereValueType = 'UUID';
        } else {
            whereValueType = 'INTEGER';
        }

        return [
            `UPDATE %I SET %s WHERE %I = $${setValues.length + 1}::${whereValueType} RETURNING *`,
            [this.getTableName(), mergedSetClause, this.getIdColumnName()],
            [...setValues, id]
        ];
    }

    getDeleteQueryForId(id: TId): [string, unknown[], unknown[]] {
        if (typeof id === 'string') {
            return [
                `DELETE FROM %I WHERE %I = $1::UUID`, 
                [this.getTableName(), this.getIdColumnName()], 
                [id]
            ];
        }

        return [
            `DELETE FROM %I WHERE %I = $1::INTEGER`,
            [this.getTableName(), this.getIdColumnName()], 
            [id]
        ];
    }

    getPaginatedEntities(
        entityRows: Array<Record<string, unknown>>, 
        filter: EntityPaginationFilter, 
        totalCountRow: Record<string, unknown>
    ): EntityPaginationData<TEnt> {
        return {
            items: entityRows.map((row) => this.getEntityFromRow(row)),
            totalElements: parseInt(<string>(totalCountRow.total_count ?? '0'), 10),
            page: filter.page,
            pageSize: filter.size
        };
    }

    getEntityFromRow(row: Record<string, unknown>): TEnt {
        return <TEnt>Object.entries<[string | true, string]>(
            this.getEntityPropsToColumnsMap()
        ).reduce<Partial<TEnt>>((acc, [key, [rowKey]]) => {
            const realRowKey = rowKey === true ? key : rowKey;
            if (!row.hasOwnProperty(realRowKey)) {
                throw new Error(`Row from storage misses key: ${key}`);
            }
            acc[key] = row[realRowKey];
            return acc;
        }, {});
    }

    getSampleId(): TId {
        return this.sampleId;
    }

    getTableName(): string {
        return this.tableName;
    }

    getIdColumnName(): string {
        return this.idColumnName;
    }

    private tableName: string;
    private idColumnName: string;
    private sampleId: TId;
}