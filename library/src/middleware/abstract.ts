import { Application, RequestHandler } from 'express';

export { Request, Response, NextFunction, Application, RequestHandler } from 'express';

export abstract class Middleware {
    prepareApp(_app: Application): void {

    }

    useInApp(app: Application): void {
        app.use(this.getHandlers());
    }

    abstract getHandlers(): RequestHandler[];
}
