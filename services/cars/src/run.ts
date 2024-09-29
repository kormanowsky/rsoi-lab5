import { CarsServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8070', 10),
    server = new CarsServer(port);

server.start();