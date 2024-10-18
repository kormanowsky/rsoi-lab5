import { EntityPaginationFilter } from '@rsoi-lab2/library';

export interface Car {
    id?: number;
    carUid: string;
    brand: string;
    model: string;
    registrationNumber: string;
    power: number;
    price: number;
    type: 'SEDAN' | 'SUV' | 'MINIVAN' | 'ROADSTER';
    availability: boolean;
}

export type CarId = Exclude<Car['id'], undefined>;

export interface CarFilter extends EntityPaginationFilter {
    showAll: boolean;
}
