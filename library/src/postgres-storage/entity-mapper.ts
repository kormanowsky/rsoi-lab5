import { EntityPaginationData, EntityPaginationFilter } from "../logic";

export abstract class PostgresEntityMapper<TEnt, TEntFilter, TId extends string | number = string> {
    constructor(tableName: string, idColumnName: string, sampleId: TId) {
        this.tableName = tableName;
        this.idColumnName = idColumnName;
        this.sampleId = sampleId;
    }

    abstract getInsertQueryForEntity(entity: TEnt): [string, unknown[], unknown[]];
    abstract getSelectQueryForFilter(filter: TEntFilter): [string, unknown[], unknown[]];
    abstract getPaginatedSelectQueryForFilter(filter: TEntFilter & EntityPaginationFilter): [string, unknown[], unknown[]];
    abstract getSelectTotalCountQueryForFilter(filter: TEntFilter): [string, unknown[], unknown[]];

    abstract getEntityPropsToColumnsMap(): Record<keyof TEnt, [string | true, string]>;

    abstract getPaginatedEntities(
        entityRows: Array<Record<string, unknown>>, 
        filter: EntityPaginationFilter, 
        totalCountRow: Record<string, unknown>
    );

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