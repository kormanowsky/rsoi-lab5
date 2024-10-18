import express, { Express } from 'express';

export abstract class Server {
    constructor(port: number) {
        this.server = express();
        this.server.use(express.json());

        this.port = port;

        this.server.get('/manage/health', (_, res) => {res.sendStatus(200)});

        this.initRoutes();
    }

    start(): void {
        this.server.listen(this.port, '0.0.0.0');
    }

    stop(): void {
        
    }

    protected getServer(): Express {
        return this.server;
    }

    protected abstract initRoutes(): void;

    private server: Express;
    private port: number;
}
