export interface EntityPaginationData<TEnt> {
    page: number;
    pageSize: number;
    totalElements: number;
    items: TEnt[];
}

export type EntityPaginationResponse<TEnt> = EntityPaginationData<TEnt>;