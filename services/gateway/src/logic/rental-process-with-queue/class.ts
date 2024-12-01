import { 
    Car, CarFilter, CarId, Payment, PaymentFilter, PaymentId, Rental, RentalFilter, RentalId, EntityLogic 
} from "@rsoi-lab2/library";

import {
    ConfigurableLogic
} from '../interface';

import { 
    RentalProcessLogic,
    RentalProcessCancelRequest, 
    RentalProcessCancelResponse, 
    RentalProcessFinishRequest, 
    RentalProcessFinishResponse 
} from "../rental-process";

import { RentalDereferenceUidsLogic } from "../rental-retrieval";

import { Queue, QueueJob } from "./interface";

export const maxQueueJobKeepAliveMs = 60_000;

export class RQRentalProcessLogic extends RentalProcessLogic {
    constructor(
        queue: Queue,
        carsLogic: ConfigurableLogic<EntityLogic<Car, CarFilter, CarId>>,
        paymentsLogic: ConfigurableLogic<EntityLogic<Payment, PaymentFilter, PaymentId>>,
        rentalsLogic: ConfigurableLogic<EntityLogic<Rental, RentalFilter, RentalId>>,
        rentalDereferenceLogic: ConfigurableLogic<RentalDereferenceUidsLogic>,
        jobKeepAliveMs: number = maxQueueJobKeepAliveMs
    ) {
        super(carsLogic, paymentsLogic, rentalsLogic, rentalDereferenceLogic);
        this.queue = queue;
        this.jobKeepAliveMs = jobKeepAliveMs;
        this.queue.process(this.processQueueJob.bind(this));
    }

    async cancelRental(request: RentalProcessCancelRequest): Promise<RentalProcessCancelResponse> {
        return this.cancelRentalOrQueueRetry(request);
    }

    async finishRental(request: RentalProcessFinishRequest): Promise<RentalProcessFinishResponse> {
        return this.finishRentalOrQueueRetry(request);
    }

    protected async cancelRentalOrQueueRetry(
        request: RentalProcessCancelRequest, 
        createdAt: number = Date.now()
    ): Promise<RentalProcessCancelResponse> {
        const superResult = await super.cancelRental(request);

        if (superResult.error === true) {
            console.warn(`Queuing retry of cancelRental() after error: ${superResult.error} ${superResult.message}`);

            const job = this.queue.createJob({
                type: 'CANCEL_RENTAL',
                payload: request,
                createdAt
            });

            job.save();
        } else {
            console.info('Successful request, nothing to queue');
        }

        return {error: false};
    }

    protected async finishRentalOrQueueRetry(
        request: RentalProcessFinishRequest,
        createdAt: number = Date.now()
    ): Promise<RentalProcessFinishResponse> {
        const superResult = await super.finishRental(request);

        if (superResult.error === true) {
            console.warn(`Queuing retry of finishRental() after error: ${superResult.error} ${superResult.message}`);

            const job = this.queue.createJob({
                type: 'FINISH_RENTAL',
                payload: request,
                createdAt
            });

            job.save();
        } else {
            console.info('Successful request, nothing to queue');
        }

        return {error: false};
    }

    protected async processQueueJob(job: Queue.Job<QueueJob>): Promise<void> {
        const {data: {type, payload, createdAt}} = job;

        if (Date.now() - createdAt > this.jobKeepAliveMs) {
            return;
        }

        setTimeout(async () => {
            if (type === 'CANCEL_RENTAL') {
                await this.cancelRentalOrQueueRetry(payload, createdAt);
            } else if (type === 'FINISH_RENTAL') {
                await this.finishRentalOrQueueRetry(payload, createdAt);
            }
        }, this.jobKeepAliveMs / 10);
    }

    private queue: Queue<QueueJob>;
    private jobKeepAliveMs: number;
}
