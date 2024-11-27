import session from 'express-session';
import Keycloak from 'keycloak-connect';

import { Request, Response, NextFunction, Middleware, RequestHandler, Application } from './abstract';



export class AuthKeycloakMiddleware extends Middleware {
    constructor(secret: string, config: Keycloak.KeycloakConfig, options?: Partial<Keycloak.KeycloakOptions>) {
        super();

        this.sessionSecret = secret;
        this.sessionStore = new session.MemoryStore();
        this.keycloak = new Keycloak({store: this.sessionStore, ...options}, config);
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
    }

    override getHandlers(): RequestHandler[] {
        const kcHandler = this.keycloak.protect();

        const adapterHandler = (req: Request, res: Response, next: NextFunction): void => {
            const token: string | undefined = (<any>req).kauth?.grant?.access_token?.content;

            if (token == null) {
                res.status(401).send({message: 'Authentication failure'});
                return;
            }

            console.log('TOKEN', token);

            req.body.auth = token;

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

    private sessionStore: session.Store;
    private sessionSecret: string;
    private keycloak: Keycloak.Keycloak;
}
