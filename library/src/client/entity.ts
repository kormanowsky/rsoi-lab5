import { EntityCRUD, EntityPaginationData } from '../logic';

export class EntityClient<
    TEnt, 
    TEntFilter, 
    TId extends string | number = string, 
    TPaginationEnabled extends boolean = false
> 
    implements EntityCRUD<TEnt, TId>
{
    constructor(baseUrl: string, opts?: RequestInit) {
        this.baseUrl = baseUrl;
        this.opts = opts;
    }

    withOpts(opts: RequestInit): EntityClient<TEnt, TEntFilter, TId, TPaginationEnabled> {
        return new EntityClient<TEnt, TEntFilter, TId, TPaginationEnabled>(this.baseUrl, opts);
    }

    async getOne(id: TId, opts?: RequestInit): Promise<Required<TEnt> | null> {
        const response = await fetch(`${this.baseUrl}${id}`, {
            ...this.opts,
            ...opts,
            method: 'GET'
        });

        if (response.ok) {
            return await response.json();
        }

        return null;
    }

    async getMany(filter: TEntFilter, opts?: RequestInit): 
        Promise<
            TPaginationEnabled extends true ? 
            EntityPaginationData<Required<TEnt>> :  
            Array<Required<TEnt>>
        > 
    {
        const queryParams = new URLSearchParams();

        for(const [key, value] of Object.entries(<Record<string, any>>filter)) {
            queryParams.set(key, value.toString());
        }

        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
            ...this.opts,
            ...opts,
            method: 'GET'
        });

        if (response.ok) {
            return await response.json();
        }

        throw new Error('failed to getMany');
    }

    async create(entity: TEnt, opts?: RequestInit): Promise<Required<TEnt>> {
        const response = await fetch(this.baseUrl, {
            ...this.opts,
            ...opts,
            method: 'POST',
            headers: {
                ...this.opts?.headers,
                ...opts?.headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entity)
        });

        if (response.ok) {
            return await response.json();
        }
        
        throw new Error('failed to create');
    }

    async update(id: TId, update: Partial<TEnt>, opts?: RequestInit): Promise<Required<TEnt>> {
        const response = await fetch(`${this.baseUrl}${id}`, {
            ...this.opts,
            ...opts,
            method: 'PATCH',
            headers: {
                ...this.opts?.headers,
                ...opts?.headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(update)
        });

        if (response.ok) {
            return await response.json();
        }
        
        throw new Error('failed to update');
    }

    async delete(id: TId, opts?: RequestInit): Promise<boolean> {
        const response = await fetch(`${this.baseUrl}${id}`, {
            ...this.opts,
            ...opts,
            method: 'DELETE'
        });

        if (response.ok) {
            return await response.json();
        }
        
        throw new Error('failed to delete');
    }

    protected getBaseUrl(): string {
        return this.baseUrl;
    }

    private baseUrl: string;
    private opts?: RequestInit;
}