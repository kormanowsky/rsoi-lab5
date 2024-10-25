import { PaymentsLogic } from './logic';
import { PostgresPaymentMapper, PostgresPaymentsStorage } from './postgres-storage';
import { PaymentServer } from './server';

const 
    port = parseInt(process.env.PORT ?? '8000', 10),
    connString = process.env.CONN_STRING ?? '--invalid--',
    mapper = new PostgresPaymentMapper('payment'),
    storage = new PostgresPaymentsStorage(connString, mapper),
    logic = new PaymentsLogic(storage),
    server = new PaymentServer(logic, 'api/v1/payments', port);

server.start();
