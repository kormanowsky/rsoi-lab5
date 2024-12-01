import { EntityPaginationFilter } from './logic';

export interface Car {
    id?: number;
    carUid: string;
    brand: string;
    model: string;
    registrationNumber: string;
    power: number;
    price: number;
    type: 'SEDAN' | 'SUV' | 'MINIVAN' | 'ROADSTER';
    available: boolean;
}

export type CarId = string;

export interface CarFilter extends EntityPaginationFilter {
    showAll: boolean;
}

export interface Payment {
    id?: number;
    paymentUid?: string;
    status: 'PAID' | 'CANCELED';
    price: number;
}

export type PaymentId = string;

// Намеренно пустой интерфейс
export interface PaymentFilter {}

export interface Rental {
    id?: number;
    rentalUid?: string;
    username: string;
    paymentUid: string;
    carUid: string;
    dateFrom: Date;
    dateTo: Date;
    status: 'IN_PROGRESS' | 'FINISHED' | 'CANCELED';
}

export type RentalId = string;

export interface RentalFilter {}

export interface UsernameUserCredential {
    type: 'header';
    headerName: 'X-User-Name';
    headerValue: string;
}

export interface BearerUserCredential {
    type: 'header';
    headerName: 'Authorization';
    headerValue: string;
}

export type UserCredential = UsernameUserCredential | BearerUserCredential;

export interface User {
    username: string;
    credential: UserCredential;
};
