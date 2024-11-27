import { Request, Response, NextFunction, Application } from 'express';

export { Request, Response, NextFunction } from 'express';

export abstract class Middleware {
    useInApp(app: Application): void {
        app.use(this.action.bind(this));
    }

    protected abstract action(req: Request, res: Response, next: NextFunction): void;
}
