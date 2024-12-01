import { Car, CarId, RentalFilter, RentalId } from '@rsoi-lab2/library';

import { RetrievedRentalWithPayment } from '../rental-retrieval';

export interface RentalProcessSuccessResponse {
    error: false;
}

export interface RentalProcessErrorResponse {
    error: true;
    code: number;
    message: string;
}

export interface RentalProcessStartRequest {
    carUid: CarId;
    dateFrom: Date;
    dateTo: Date;
};

export interface RentalProcessStartRequestWithPrice extends RentalProcessStartRequest {
    price: number;
}

export interface RentalProcessStartSuccessResponse extends RentalProcessSuccessResponse {
    error: false;
    rental: RetrievedRentalWithPayment;
}

export type RentalProcessStartResponse = RentalProcessStartSuccessResponse | 
    RentalProcessErrorResponse;

export interface RentalProcessCancelRequest {
    rentalUid: RentalId;
}

export type RentalProcessCancelResponse = RentalProcessSuccessResponse | RentalProcessErrorResponse;

export type RentalProcessFinishRequest = RentalProcessCancelRequest;

export type RentalProcessFinishResponse = RentalProcessSuccessResponse | RentalProcessErrorResponse;

export type RentalProcessCalculateRequest = RentalProcessStartRequest;

export type RentalProcessCalculateResponse = RentalProcessErrorResponse | {
    error: false;
    price: number;
}