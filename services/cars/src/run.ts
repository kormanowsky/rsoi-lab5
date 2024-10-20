import { CarsLogic } from "./logic";
import { PostgresCarsStorage } from "./postgres-storage/entity";
import { PostgresCarMapper } from "./postgres-storage/entity-mapper";
import { CarsServer } from "./server";

const 
    port = parseInt(process.env.PORT ?? '8070', 10),
    connString = process.env.CONN_STRING ?? '--invalid--',
    mapper = new PostgresCarMapper('cars'),
    storage = new PostgresCarsStorage(connString, mapper),
    logic = new CarsLogic(storage),
    server = new CarsServer(logic, 'api/v1/cars', port, true);

server.start();