import { RentalLogic } from './logic';
import { PostgresRentalMapper, PostgresRentalStorage } from './postgres-storage';
import { RentalServer } from './server';

const 
    port = parseInt(process.env.PORT ?? '8000', 10),
    connString = process.env.CONN_STRING ?? '--invalid--',
    mapper = new PostgresRentalMapper('rental'),
    storage = new PostgresRentalStorage(connString, mapper),
    logic = new RentalLogic(storage),
    server = new RentalServer(logic, 'api/v1/rentals', port);

server.start();
