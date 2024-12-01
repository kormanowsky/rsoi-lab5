import { AuthUsernameHeaderMiddleware, AuthKeycloakMiddleware } from '@rsoi-lab2/library';

import { PaymentsLogic } from './logic';
import { PostgresPaymentMapper, PostgresPaymentsStorage } from './postgres-storage';
import { PaymentServer } from './server';

const 
    port = parseInt(process.env.PORT ?? '8000', 10),
    connString = process.env.CONN_STRING ?? '--invalid--',
    noOauth = Boolean(process.env.NO_OAUTH);

const oauthConfig = noOauth ? null : {
    sessionSecret: process.env.SESSION_SECRET,
    keycloakConfig: JSON.parse(process.env.KC_CONFIG ?? '{}'),
};

const authMiddleware = noOauth ? 
    new AuthUsernameHeaderMiddleware() : 
    new AuthKeycloakMiddleware(oauthConfig.sessionSecret, oauthConfig.keycloakConfig);

const 
    mapper = new PostgresPaymentMapper('payment'),
    storage = new PostgresPaymentsStorage(connString, mapper),
    logic = new PaymentsLogic(storage),
    server = new PaymentServer(logic, authMiddleware, 'api/v1/payments', port);

server.start();
