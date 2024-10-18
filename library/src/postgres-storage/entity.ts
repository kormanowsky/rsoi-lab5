import pg from 'pg';
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
            [query, params] = this.mapper.getSelectQueryForId(id),
            resultRows = await this.client.query(query, params);
        
        if (resultRows.rowCount === 0) {
            return null;
        }

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async getMany(filter: TEntFilter): Promise<TEnt[]> {
        await this.ready;

        const 
            [query, params] = this.mapper.getSelectQueryForFilter(filter),
            resultRows = await this.client.query(query, params);
        
        return resultRows.rows.map((row) => this.mapper.getEntityFromRow(row));
    }

    async create(entity: TEnt): Promise<TEnt> {
        await this.ready;

        const 
            [query, params] = this.mapper.getInsertQueryForEntity(entity),
            resultRows = await this.client.query(query, params);

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async update(update: Partial<TEnt>): Promise<TEnt> {
        await this.ready;

        const 
            [query, params] = this.mapper.getUpdateQueryForEntity(update),
            resultRows = await this.client.query(query, params);

        return this.mapper.getEntityFromRow(resultRows.rows[0]);
    }

    async delete(id: TId): Promise<boolean> {
        await this.ready;

        const 
            [query, params] = this.mapper.getDeleteQueryForId(id),
            resultRows = await this.client.query(query, params);
        
        return (resultRows.rowCount ?? 0) > 0;
    }

    private mapper: PostgresEntityMapper<TEnt, TEntFilter, TId>;
    private client: pg.Client;
    private ready: Promise<void>;
}
