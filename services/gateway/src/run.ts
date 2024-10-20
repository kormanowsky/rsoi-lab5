import { CarsClient } from "./client";
import { GatewayServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8000', 10),
    carsApiUrl = process.env.CARS_API_URL!,
    paymentApiUrl = process.env.PAYMENT_API_URL!,
    rentalApiUrl = process.env.RENTAL_API_URL!,
    carsClient = new CarsClient(carsApiUrl),
    server = new GatewayServer(carsClient, port);

server.start();