import { CarsClient } from "./client";
import { GatewayServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8080', 10),
    carsServiceUrl = process.env.CARS_SERVICE_URL ?? 'http://localhost:8070',
    carsClient = new CarsClient(carsServiceUrl),
    server = new GatewayServer(carsClient, port);

server.start();