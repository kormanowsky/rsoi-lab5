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

export interface EntityCRUD<TEnt, TId extends string | number = string> {
    getOne(id: TId): Promise<Required<TEnt> | null>; 
    create(entity: TEnt): Promise<Required<TEnt>>;
    update(id: TId, update: Partial<TEnt>): Promise<Required<TEnt>>; 
    delete(id: TId): Promise<boolean>;
}

export interface EntityFilter<TEnt, TEntFilter> {
    getMany(filter: TEntFilter): Promise<Array<Required<TEnt>>>;
}

export interface EntityPaginator<TEnt, TEntFilter> {
    // Пагинация как плагин
    supportsPagination(): boolean;
    getPaginatedMany(filter: TEntFilter & EntityPaginationFilter): Promise<EntityPaginationData<Required<TEnt>>>;
}

export interface EntityValidator<TEnt, TEntFilter, TId extends string | number = string> {
    // Валидации: бросают исключение, если что
    validateId(value: TId): void;
    validateEntity(value: TEnt): void;
    validatePartialEntity(value: Partial<TEnt>): void;
    validateFilter(value: TEntFilter): void;
}

export interface EntityIdTypeSwitch {
    // ID может быть как строкой так и числом
    getIdType(): 'string' | 'number';
}

export interface EntityLogic<TEnt, TEntFilter, TId extends string | number = string>
    extends EntityCRUD<TEnt, TId>, 
        EntityPaginator<TEnt, TEntFilter>,
        EntityFilter<TEnt, TEntFilter>,
        EntityValidator<TEnt, TEntFilter, TId>,
        EntityIdTypeSwitch {
}

export interface EntityStorage<TEnt, TEntFilter, TId extends string | number = string>
    extends EntityCRUD<TEnt, TId>, 
        EntityFilter<TEnt, TEntFilter>,
        EntityPaginator<TEnt, TEntFilter>,
        EntityIdTypeSwitch {
}

export interface EntityParser<TEnt, TEntFilter, TId extends string | number = string> {
    parseId(value: unknown): TId;
    parseEntity(value: unknown): TEnt;
    parsePartialEntity(value: unknown): Partial<TEnt>;
    parseFilter(value: unknown): TEntFilter;
    supportsPagination(): boolean;
    parsePaginationFilter?(value: unknown): TEntFilter & EntityPaginationFilter;
}
