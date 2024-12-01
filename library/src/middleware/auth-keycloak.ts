import session from 'express-session';
import Keycloak from 'keycloak-connect';

import { ServerRequest, ServerResponse } from '../server';

import { Request, Response, NextFunction, Middleware, RequestHandler, Application } from './abstract';



export class AuthKeycloakMiddleware extends Middleware {
    constructor(secret: string, config: Keycloak.KeycloakConfig, options?: Partial<Keycloak.KeycloakOptions>) {
        super();

        this.sessionSecret = secret;
        this.sessionStore = new session.MemoryStore();
        this.keycloak = new Keycloak({store: this.sessionStore, ...options}, config);

        this.keycloak.accessDenied = this.handleAccessDenied.bind(null);
    }

    override prepareApp(app: Application): void {
        app.use(
            session({
                store: this.sessionStore,
                resave: false,
                saveUninitialized: true,
                secret: this.sessionSecret
            })
        );

        app.use(this.keycloak.middleware());

        app.use((request: ServerRequest) => request.user = null);
    }

    override getHandlers(): RequestHandler[] {
        const kcHandler = this.keycloak.protect();

        const adapterHandler = (req: ServerRequest, res: ServerResponse, next: NextFunction): void => {
            const accessToken: Record<string, any> | undefined = (<any>req).kauth?.grant?.access_token;

            if (accessToken == null) {
                this.handleAccessDenied(req, res);
                return;
            }

            const {token, content} = accessToken;

            if (token == null || content == null || content.preferred_username == null) {
                this.handleAccessDenied(req, res);
                return;
            }

            req.user = {
                username: content.preferred_username, 
                credential: {type: 'header', headerName: 'Authorization', headerValue: `Bearer ${token}`}
            };

            next();
        };
        
        return [kcHandler, adapterHandler];
    }

    protected parseUsername(value: unknown): string {
        if (typeof value !== 'string' || value.length === 0) {
            throw new Error('Incorrect username');
        }

        return value;
    }

    protected handleAccessDenied(_: Request, response: Response): void {
        response.status(401).send({message: 'Authorization failure'}).end();
    }

    private sessionStore: session.Store;
    private sessionSecret: string;
    private keycloak: Keycloak.Keycloak;
}
