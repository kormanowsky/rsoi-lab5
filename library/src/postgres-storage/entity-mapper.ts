import { EntityPaginationData, EntityPaginationFilter } from "../logic";

export abstract class PostgresEntityMapper<TEnt, TEntFilter, TId extends string | number = string> {
    constructor(tableName: string, idColumnName: string, sampleId: TId) {
        this.tableName = tableName;
        this.idColumnName = idColumnName;
        this.sampleId = sampleId;
    }

    abstract getInsertQueryForEntity(entity: TEnt): [string, unknown[], unknown[]];
    abstract getUpdateQueryForEntity(entity: {id: TId, update: Partial<TEnt>}): [string, unknown[], unknown[]];
    abstract getSelectQueryForFilter(filter: TEntFilter): [string, unknown[], unknown[]];
    abstract getPaginatedSelectQueryForFilter(filter: TEntFilter & EntityPaginationFilter): [string, unknown[], unknown[]];
    abstract getSelectTotalCountQueryForFilter(filter: TEntFilter): [string, unknown[], unknown[]];
    abstract getEntityFromRow(row: Record<string, unknown>): TEnt;

    abstract getPaginatedEntities(
        entityRows: Array<Record<string, unknown>>, 
        filter: EntityPaginationFilter, 
        totalCountRow: Record<string, unknown>
    );

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