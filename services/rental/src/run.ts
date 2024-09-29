import { RentalServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8060', 10),
    server = new RentalServer(port);

server.start();
