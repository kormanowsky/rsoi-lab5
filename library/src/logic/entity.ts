export interface EntityPaginationFilter {
    page: number;
    size: number;
}

export interface EntityPaginationData<TEnt> {
    page: number;
    pageSize: number;
    totalElements: number;
    items: TEnt[];
}

export type EntityPaginationResponse<TEnt> = EntityPaginationData<TEnt>;

export interface EntityCRUD<TEnt, TEntFilter, TId extends string | number = string> {
    getOne(id: TId): Promise<TEnt | null>; 
    getMany(filter: TEntFilter): Promise<TEnt[]>;
    create(entity: TEnt): Promise<TEnt>;
    update(id: TId, update: Partial<TEnt>): Promise<TEnt>; 
    delete(id: TId): Promise<boolean>;
}

export interface EntityPaginator<TEnt, TEntFilter> {
    // Пагинация как плагин
    supportsPagination(): boolean;
    getPaginatedMany(filter: TEntFilter & EntityPaginationFilter): Promise<EntityPaginationData<TEnt>>;
}

export interface EntityValidator<TEnt, TEntFilter, TId extends string | number = string> {
    // Валидации: бросают исключение, если что
    validateId(value: TId): void;
    validateEntity(value: TEnt): void;
    validatePartialEntity(value: Partial<TEnt>): void;
    validateFilter(value: TEntFilter): void;
}

export interface EntityLogic<TEnt, TEntFilter, TId extends string | number = string>
    extends EntityCRUD<TEnt, TEntFilter, TId>, 
        EntityPaginator<TEnt, TEntFilter>,
        EntityValidator<TEnt, TEntFilter, TId> {
    // ID может быть как строкой так и числом
    getIdType(): 'string' | 'number';
}

export interface EntityStorage<TEnt, TEntFilter, TId extends string | number = string>
    extends EntityCRUD<TEnt, TEntFilter, TId>, EntityPaginator<TEnt, TEntFilter> {
    // Возвраащет пример ID для этого хранилища
    getSampleId(): TId;
}

export interface EntityParser<TEnt, TEntFilter, TId extends string | number = string> {
    parseId(value: unknown): TId;
    parseEntity(value: unknown): TEnt;
    parsePartialEntity(value: unknown): Partial<TEnt>;
    parseFilter(value: unknown): TEntFilter;
    supportsPagination(): boolean;
    parsePaginationFilter?(value: unknown): TEntFilter & EntityPaginationFilter;
}
