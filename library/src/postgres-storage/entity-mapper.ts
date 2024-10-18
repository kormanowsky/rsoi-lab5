export abstract class PostgresEntityMapper<TEnt, TEntFilter, TId extends string | number = number> {
    constructor(tableName: string, sampleId: TId) {
        this.tableName = tableName;
        this.sampleId = sampleId;
    }

    abstract getInsertQueryForEntity(entity: TEnt): [string, unknown[], unknown[]];
    abstract getUpdateQueryForEntity(entity: Partial<TEnt>): [string, unknown[], unknown[]];
    abstract getSelectQueryForFilter(filter: TEntFilter): [string, unknown[], unknown[]];
    abstract getEntityFromRow(row: Record<string, unknown>): TEnt;

    getSelectQueryForId(id: TId): [string, unknown[], unknown[]] {
        if (typeof id === 'string') {
            return [
                `SELECT * FROM %I WHERE id = $1::TEXT`, 
                [this.getTableName()],
                [id]
            ];
        }

        return [
            `SELECT * FROM %I WHERE id = $1::INTEGER`,
            [this.getTableName()],
            [id]
        ];
    }

    getDeleteQueryForId(id: TId): [string, unknown[], unknown[]] {
        if (typeof id === 'string') {
            return [
                `DELETE FROM %I WHERE id = $1::TEXT`, 
                [this.getTableName()], 
                [id]
            ];
        }

        return [
            `DELETE FROM %I WHERE id = $1::INTEGER`,
            [this.getTableName()], 
            [id]
        ];
    }

    getSampleId(): TId {
        return this.sampleId;
    }

    getTableName(): string {
        return this.tableName;
    }

    private tableName: string;
    private sampleId: TId;
}