import { Express, Request, Response } from "express";

import { EntityStorage } from "../storage";

import { Server } from "./abstract";

export class EntityServer<TEnt, TEntFilter, TId extends string | number = number> extends Server {
    constructor(
        storage: EntityStorage<TEnt, TEntFilter, TId>, 
        basePath: string, 
        port: number
    ) {
        super(port);
        this.basePath = basePath;
        this.storage = storage;
    }

    protected initRoutes(): void {
        const server = this.getServer();

        server
            .route(`/${this.basePath}`)
            .get(this.getMany.bind(this))
            .post(this.create.bind(this));

        server
            .route(`/${this.basePath}/:id`)
            .get(this.getOne.bind(this))
            .patch(this.update.bind(this))
            .delete(this.delete.bind(this));
    }

    protected getOne(req: Request, res: Response): void {
        let idParsed: TId;

        try {
            idParsed = this.parseIdParam(req.params.id);

        } catch (err) {
            res.status(400).send({error: 'Bad ID In Request'});
            console.log(err);
            return;
        }

        this.storage.getOne(idParsed).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected getMany(req: Request, res: Response): void {
        this.storage.getMany(<TEntFilter>req.query).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected create(req: Request, res: Response): void {
        this.storage.create(<TEnt>req.body).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected update(req: Request, res: Response): void {
        let idParsed: TId;

        try {
            idParsed = this.parseIdParam(req.params.id);

        } catch (err) {
            res.status(400).send({error: 'Bad ID In Request'});
            console.log(err);
            return;
        }

        this.storage.update(
            <Partial<TEnt>>{...req.body, id: idParsed}
        ).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected delete(req: Request, res: Response): void {
        let idParsed: TId;

        try {
            idParsed = this.parseIdParam(req.params.id);

        } catch (err) {
            res.status(400).send({error: 'Bad ID In Request'});
            console.log(err);
            return;
        }

        this.storage.delete(idParsed)
            .then(() => res.status(204).send())
            .catch((err) => {
                res.status(500).send({error: 'Internal Server Error'});
                console.error(err);
            });
    }

    protected parseIdParam(idParam: string): TId {
        const 
            idSample = this.storage.getSampleId();

        let idParsed: TId;

        if (typeof idSample === 'string') {
            idParsed = <TId>idParam;
        } else if (typeof idSample === 'number') {
            idParsed = <TId>parseInt(idParam, 10);

            if (isNaN(<number>idParsed)) {
                throw new Error('Bad ID');
            }
        } else {
            throw new Error('Bad ID Config');
        }

        return idParsed;
    }

    private storage: EntityStorage<TEnt, TEntFilter, TId>;
    private basePath: string;
}
