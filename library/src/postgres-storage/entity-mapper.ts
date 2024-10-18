export abstract class PostgresEntityMapper<TEnt, TEntFilter, TId extends string | number = number> {
    constructor(tableName: string, sampleId: TId) {
        this.tableName = tableName;
        this.sampleId = sampleId;
    }

    abstract getInsertQueryForEntity(entity: TEnt): [string, unknown[]];
    abstract getUpdateQueryForEntity(entity: Partial<TEnt>): [string, unknown[]];
    abstract getCreateQueryForEntity(entity: TEnt): [string, unknown[]];
    abstract getSelectQueryForFilter(filter: TEntFilter): [string, unknown[]];
    abstract getEntityFromRow(row: Record<string, unknown>): TEnt;

    getSelectQueryForId(id: TId): [string, unknown[]] {
        if (typeof id === 'string') {
            return [
                `SELECT * FROM $1::TEXT WHERE id = $2::TEXT`, 
                [this.getTableName(), id]
            ];
        }

        return [
            `SELECT * FROM $1::TEXT WHERE id = $2::INTEGER`,
            [this.getTableName(), id]
        ];
    }

    getDeleteQueryForId(id: TId): [string, unknown[]] {
        if (typeof id === 'string') {
            return [
                `DELETE FROM $1::TEXT WHERE id = $2::TEXT`, 
                [this.getTableName(), id]
            ];
        }

        return [
            `DELETE FROM $1::TEXT WHERE id = $2::INTEGER`,
            [this.getTableName(), id]
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