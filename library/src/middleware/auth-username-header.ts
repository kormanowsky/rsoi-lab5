import { Application, RequestHandler } from 'express';

import { ServerRequest, ServerResponse } from '../server';

import { NextFunction, Middleware } from './abstract';

export class AuthUsernameHeaderMiddleware extends Middleware {
    constructor(headerName: string = 'x-user-name') {
        super();
        this.headerName = headerName;
    }
    
    prepareApp(app: Application): void {
        app.use((request: ServerRequest) => request.user = null);
    }

    override getHandlers(): RequestHandler[] {
        const handler = (req: ServerRequest, res: ServerResponse, next: NextFunction) => {
            let username: string;

            try {
                username = this.parseUsername(req.headers[this.headerName]);
            } catch (err) {
                res.status(401).send({message: 'Authentication failure'});
                console.log(err);
                return;
            }
    
            req.user = {
                username, 
                credential: {type: 'header', headerName: 'X-User-Name', headerValue: username}
            };
    
            next();
        };

        return [handler];
    }

    protected parseUsername(value: unknown): string {
        if (typeof value !== 'string' || value.length === 0) {
            throw new Error('Incorrect username');
        }

        return value;
    }

    private headerName: string;
}
