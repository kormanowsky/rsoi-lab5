import { AuthUsernameHeaderMiddleware, AuthKeycloakMiddleware } from '@rsoi-lab2/library';

import { RentalLogic } from './logic';
import { PostgresRentalMapper, PostgresRentalStorage } from './postgres-storage';
import { RentalServer } from './server';

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
    mapper = new PostgresRentalMapper('rental'),
    storage = new PostgresRentalStorage(connString, mapper),
    logic = new RentalLogic(storage),
    server = new RentalServer(logic, authMiddleware, 'api/v1/rentals', port);

server.start();
