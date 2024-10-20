import { EntityPaginationData, EntityPaginationFilter } from "../server";

export interface EntityStorage<TEnt, TEntFilter, TId extends string | number = number> {
    getOne(id: TId): Promise<TEnt | null>; 
    getMany(filter: TEntFilter): Promise<TEnt[]>;
    create(entity: TEnt): Promise<TEnt>;
    update(update: Partial<TEnt>): Promise<TEnt>; 
    delete(id: TId): Promise<boolean>;
    getSampleId(): TId;
    // Пагинация как плагин
    supportsPagination(): boolean;
    getPaginatedMany(filter: TEntFilter & EntityPaginationFilter): Promise<EntityPaginationData<TEnt>>;
}
