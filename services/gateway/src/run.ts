import { GatewayServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8080', 10),
    server = new GatewayServer(port);

server.start();