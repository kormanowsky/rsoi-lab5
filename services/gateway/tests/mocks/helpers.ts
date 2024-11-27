import { RentalDereferenceUidsLogic, RentalRetrievalLogic, RentalsLogic, CarsLogic, PaymentsLogic, RentalProcessLogic } from '../../src/logic';

import { 
    MockCarsWithErrorsClient, 
    MockPaymentsWithErrorsClient, 
    MockRentalsWithErrorsClient, 
    MockCarsClient, 
    MockPaymentsClient, 
    MockRentalsClient 
} from './client';

import { mockCar, mockPayment, mockRental } from './const';

export function createRentalDereferenceUidsLogic(
    carsOk: boolean, 
    paymentsOk: boolean
): RentalDereferenceUidsLogic {
    const 
        carsClient = carsOk ? new MockCarsClient([mockCar]) : new MockCarsWithErrorsClient(),
        paymentsClient = paymentsOk ? new MockPaymentsClient([mockPayment]) : new MockPaymentsWithErrorsClient();

    return new RentalDereferenceUidsLogic(
        new CarsLogic(carsClient),
        new PaymentsLogic(paymentsClient)
    );
}

export function createRentalRetrievalLogic(
    carsOk: boolean, 
    paymentsOk: boolean, 
    rentalsOk: boolean
): RentalRetrievalLogic {
    const
        rentalsClient = rentalsOk ? new MockRentalsClient([mockRental]) : new MockRentalsWithErrorsClient();

    return new RentalRetrievalLogic(
        new RentalsLogic(rentalsClient), 
        createRentalDereferenceUidsLogic(carsOk, paymentsOk)
    );
}

export function createRentalProcessLogic(
    carsOk: boolean, 
    paymentsOk: boolean, 
    rentalsOk: boolean
): RentalProcessLogic {
    const 
        carsClient = carsOk ? new MockCarsClient([mockCar]) : new MockCarsWithErrorsClient(),
        paymentsClient = paymentsOk ? new MockPaymentsClient([mockPayment]) : new MockPaymentsWithErrorsClient(),
        rentalsClient = rentalsOk ? new MockRentalsClient([mockRental]) : new MockRentalsWithErrorsClient(),
        carsLogic = new CarsLogic(carsClient),
        paymentsLogic = new PaymentsLogic(paymentsClient),
        rentalsLogic = new RentalsLogic(rentalsClient);

    return new RentalProcessLogic(
        carsLogic,
        paymentsLogic,
        rentalsLogic,
        new RentalDereferenceUidsLogic(carsLogic, paymentsLogic)
    );
}