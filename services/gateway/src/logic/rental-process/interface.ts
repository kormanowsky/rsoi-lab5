import { Car, RentalFilter } from "@rsoi-lab2/library";

import { RetrievedRentalWithPayment } from "../rental-retrieval";

export interface RentalProcessStartRequest {
    carUid: Exclude<Car['carUid'], undefined>;
    dateFrom: Date;
    dateTo: Date;
    username: RentalFilter['username'];
};

export interface RentalProcessStartSuccessResponse {
    error: false;
    rental: RetrievedRentalWithPayment;
}

export interface RentalProcessStartErrorResponse {
    error: true;
    code: number;
    message: string;
}

export type RentalProcessStartResponse = RentalProcessStartErrorResponse | 
    RentalProcessStartSuccessResponse;