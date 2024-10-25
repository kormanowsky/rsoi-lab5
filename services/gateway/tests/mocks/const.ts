import { Car, Payment, Rental } from "@rsoi-lab2/library";

export const mockCar: Required<Car> = {
    id: 1,
    carUid: 'test-car-uid',
    model: 'test model',
    brand: 'test brand',
    power: 1000,
    price: 2000,
    registrationNumber: 'O000OO200',
    available: true,
    type: 'SEDAN'
}

export const mockPayment: Required<Payment> = {
    id: 1,
    paymentUid: 'test-payment-uid',
    status: 'PAID',
    price: 200
}

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