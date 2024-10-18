import pg from 'pg';
import pgFormat from 'pg-format';
import { EntityStorage } from "../storage";
import { PostgresEntityMapper } from "./entity-mapper";

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

    async getOne(id: TId): Promise<TEnt | null> {
        await this.ready;

        const 
            [query, formatParams, queryParams] = this.mapper.getSelectQueryForId(id),
            formattedQuery: string = pgFormat(query, formatParams),
            resultRows = await this.client.query(formattedQuery, queryParams);
        
        if (resultRows.rowCount === 0) {
            return null;
        }

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async getMany(filter: TEntFilter): Promise<TEnt[]> {
        await this.ready;

        const 
            [query, formatParams, queryParams] = this.mapper.getSelectQueryForFilter(filter),
            formattedQuery = pgFormat(query, formatParams),
            resultRows = await this.client.query(formattedQuery, queryParams);
        
        return resultRows.rows.map((row) => this.mapper.getEntityFromRow(row));
    }

    async create(entity: TEnt): Promise<TEnt> {
        await this.ready;

        const 
            [query, formatParams, queryParams] = this.mapper.getInsertQueryForEntity(entity),
            formattedQuery = pgFormat(query, formatParams),
            resultRows = await this.client.query(formattedQuery, queryParams);

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async update(update: Partial<TEnt>): Promise<TEnt> {
        await this.ready;

        const 
            [query, formatParams, queryParams] = this.mapper.getUpdateQueryForEntity(update),
            formattedQuery = pgFormat(query, formatParams),
            resultRows = await this.client.query(formattedQuery, queryParams);

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async delete(id: TId): Promise<boolean> {
        await this.ready;

        const 
            [query, formatParams, queryParams] = this.mapper.getDeleteQueryForId(id),
            formattedQuery = pgFormat(query, formatParams),
            resultRows = await this.client.query(formattedQuery, queryParams);
        
        return (resultRows.rowCount ?? 0) > 0;
    }

    private mapper: PostgresEntityMapper<TEnt, TEntFilter, TId>;
    private client: pg.Client;
    private ready: Promise<void>;
}
