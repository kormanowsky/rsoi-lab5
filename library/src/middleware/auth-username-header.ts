import { Request, Response, NextFunction, Middleware } from './abstract';

export class AuthUsernameHeaderMiddleware extends Middleware {
    constructor(headerName: string = 'x-user-name') {
        super();
        this.headerName = headerName;
    }

    protected override action(req: Request, res: Response, next: NextFunction): void {
        let username: string;

        try {
            username = this.parseUsername(req.headers[this.headerName]);
        } catch (err) {
            res.status(401).send({message: 'Authentication failure'});
            console.log(err);
            return;
        }

        req.body.auth = username;

        next();
    }

    protected parseUsername(value: unknown): string {
        if (typeof value !== 'string' || value.length === 0) {
            throw new Error('Incorrect username');
        }

        return value;
    }

    private headerName: string;
}
