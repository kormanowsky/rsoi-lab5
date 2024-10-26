import { CarsClient, PaymentsClient, RentalsClient } from './client';
import { CarsLogic, PaymentsLogic, RentalsLogic, RentalRetrievalLogic, RentalDereferenceUidsLogic, RentalProcessLogic, CarsRetrievalLogic } from './logic';
import { GatewayServer } from './server';

const 
    port = parseInt(process.env.PORT ?? '8000', 10),
    carsApiUrl = process.env.CARS_API_URL!,
    paymentApiUrl = process.env.PAYMENT_API_URL!,
    rentalApiUrl = process.env.RENTAL_API_URL!,
    carsClient = new CarsClient(carsApiUrl),
    paymentsClient = new PaymentsClient(paymentApiUrl),
    rentalsClient = new RentalsClient(rentalApiUrl),
    carsLogic = new CarsLogic(carsClient),
    paymentsLogic = new PaymentsLogic(paymentsClient),
    rentalsLogic = new RentalsLogic(rentalsClient),
    rentalDereferenceLogic = new RentalDereferenceUidsLogic(carsLogic, paymentsLogic),
    rentalRetrievalLogic = new RentalRetrievalLogic(rentalsLogic, rentalDereferenceLogic),
    rentalProcessLogic = new RentalProcessLogic(carsLogic, paymentsLogic, rentalsLogic, rentalDereferenceLogic),
    carsRetrievalLogic = new CarsRetrievalLogic(carsLogic);

const server = new GatewayServer(
    carsRetrievalLogic, 
    rentalRetrievalLogic, 
    rentalProcessLogic,
    port
);

server.start();