import { CarsLogic } from "./logic";
import { PostgresCarMapper, PostgresCarsStorage } from "./postgres-storage";
import { CarsServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8000', 10),
    connString = process.env.CONN_STRING ?? '--invalid--',
    mapper = new PostgresCarMapper('cars'),
    storage = new PostgresCarsStorage(connString, mapper),
    logic = new CarsLogic(storage),
    server = new CarsServer(logic, 'api/v1/cars', port, true);

server.start();