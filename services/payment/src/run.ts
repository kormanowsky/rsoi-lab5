import { PaymentServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8050', 10),
    server = new PaymentServer(port);

server.start();
