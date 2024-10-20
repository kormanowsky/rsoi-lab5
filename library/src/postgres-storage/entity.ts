import pg, { QueryResult } from 'pg';
import pgFormat from 'pg-format';
import { EntityStorage } from "../storage";
import { PostgresEntityMapper } from "./entity-mapper";
import { EntityPaginationData, EntityPaginationFilter } from '../server';

export class PostgresEntityStorage<TEnt, TEntFilter, TId extends string | number = number> 
    implements EntityStorage<TEnt, TEntFilter, TId> {
    constructor(connString: string, mapper: PostgresEntityMapper<TEnt, TEntFilter, TId>) {
        this.mapper = mapper;
        this.client = new pg.Client(connString);
        this.ready = this.client.connect();
    }

    getSampleId(): TId {
        return this.mapper.getSampleId();
    }

    supportsPagination(): boolean {
        return true;
    }

    async getOne(id: TId): Promise<TEnt | null> {
        await this.ready;

        const resultRows = await this.executeQuery(...this.mapper.getSelectQueryForId(id));
        
        if (resultRows.rowCount === 0) {
            return null;
        }

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async getMany(filter: TEntFilter): Promise<TEnt[]> {
        await this.ready;

        const resultRows = await this.executeQuery(...this.mapper.getSelectQueryForFilter(filter));
        
        return resultRows.rows.map((row) => this.mapper.getEntityFromRow(row));
    }

    async getPaginatedMany(filter: TEntFilter & EntityPaginationFilter): Promise<EntityPaginationData<TEnt>> {
        await this.ready;

        const [resultRows, totalResultRows] = await Promise.all([
            this.executeQuery(...this.mapper.getPaginatedSelectQueryForFilter(filter)),
            this.executeQuery(...this.mapper.getSelectTotalCountQueryForFilter(filter))
        ]);

        return this.mapper.getPaginatedEntities(resultRows.rows, filter, totalResultRows.rows[0]);
    }

    async create(entity: TEnt): Promise<TEnt> {
        await this.ready;

        const resultRows = await this.executeQuery(...this.mapper.getInsertQueryForEntity(entity));

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async update(update: Partial<TEnt>): Promise<TEnt> {
        await this.ready;

        const resultRows = await this.executeQuery(...this.mapper.getUpdateQueryForEntity(update));

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async delete(id: TId): Promise<boolean> {
        await this.ready;

        const resultRows = await this.executeQuery(...this.mapper.getDeleteQueryForId(id));
        
        return (resultRows.rowCount ?? 0) > 0;
    }

    protected async executeQuery<TResultRow extends Record<string, unknown>>(
        rawQuery: string, 
        formatParams: unknown[], 
        queryParams: unknown[]
    ): Promise<QueryResult<TResultRow>> {
        const formattedQuery = pgFormat.withArray(rawQuery, formatParams);
        
        return this.client.query(formattedQuery, queryParams);
    }

    private mapper: PostgresEntityMapper<TEnt, TEntFilter, TId>;
    private client: pg.Client;
    private ready: Promise<void>;
}
