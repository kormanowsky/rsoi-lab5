import { AuthUsernameHeaderMiddleware, AuthKeycloakMiddleware } from '@rsoi-lab2/library';

import { CarsLogic } from './logic';
import { PostgresCarMapper, PostgresCarsStorage } from './postgres-storage';
import { CarsServer } from './server';

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
    mapper = new PostgresCarMapper('cars'),
    storage = new PostgresCarsStorage(connString, mapper),
    logic = new CarsLogic(storage),
    server = new CarsServer(logic, authMiddleware, 'api/v1/cars', port, true);

server.start();