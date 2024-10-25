import { CarsClient, PaymentsClient, RentalsClient } from "./client";
import { CarsLogic, PaymentsLogic, RentalsLogic, RentalRetrievalLogic } from "./logic";
import { GatewayServer } from "./server";

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
    rentalRetrievalLogic = new RentalRetrievalLogic(carsLogic, paymentsLogic, rentalsLogic),
    server = new GatewayServer(carsLogic, rentalRetrievalLogic, paymentsClient, rentalsClient, port);

server.start();