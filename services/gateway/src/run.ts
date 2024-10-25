import { CarsClient, PaymentsClient, RentalsClient } from "./client";
import { CarsLogic } from "./logic";
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
    server = new GatewayServer(carsLogic, paymentsClient, rentalsClient, port);

server.start();