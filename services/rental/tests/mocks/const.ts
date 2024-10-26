import { Rental } from '@rsoi-lab2/library';

export const mockRental: Required<Rental> = {
    id: 1,
    carUid: 'test-car-uid',
    paymentUid: 'test-payment-uid',
    status: 'IN_PROGRESS',
    rentalUid: 'test-uid',
    username: 'testuser',
    dateFrom: new Date(2024, 1, 1),
    dateTo: new Date(2024, 1, 7)
}