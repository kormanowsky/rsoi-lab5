import Queue from 'bee-queue';
import { RentalProcessCancelRequest, RentalProcessFinishRequest } from '../rental-process/interface';

export {Queue};

interface QueueJobBase {
    createdAt: number;
}

export interface CancelRentalQueueJob extends QueueJobBase {
    type: 'CANCEL_RENTAL';
    payload: RentalProcessCancelRequest;
}

export interface FinishRentalQueueJob extends QueueJobBase {
    type: 'FINISH_RENTAL';
    payload: RentalProcessFinishRequest;
}

export type QueueJob = CancelRentalQueueJob | FinishRentalQueueJob;
