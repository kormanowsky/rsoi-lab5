import { EntityLogic, EntityPaginationFilter, EntityParser } from '../logic';

import { Server } from './abstract';
import { ServerRequest, ServerResponse } from './interface';

export abstract class EntityServer<TEnt, TEntFilter, TId extends string | number = number> 
    extends Server
    implements EntityParser<TEnt, TEntFilter, TId> {

    constructor(
        logic: EntityLogic<TEnt, TEntFilter, TId>, 
        basePath: string, 
        port: number,
        enablePagination: boolean = false
    ) {
        super(port);
        this.basePath = basePath;
        this.logic = logic;
        this.paginationEnabled = enablePagination && logic.supportsPagination();
    }

    protected initRoutes(): void {
        const server = this.getServer();

        server
            .route(`/${this.basePath}`)
            .get(this.paginationEnabled ? this.getPaginatedMany.bind(this) : this.getMany.bind(this))
            .post(this.create.bind(this));

        server
            .route(`/${this.basePath}/:id`)
            .get(this.getOne.bind(this))
            .patch(this.update.bind(this))
            .delete(this.delete.bind(this));
    }

    protected getOne(req: ServerRequest, res: ServerResponse): void {
        let idParsed: TId;

        try {
            idParsed = this.parseId(req.params.id);

        } catch (err) {
            res.status(400).send({error: 'Bad ID In Request'});
            console.log(err);
            return;
        }

        this.logic.getOne(idParsed).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected getMany(req: ServerRequest, res: ServerResponse): void {
        let parsedFilter: TEntFilter;

        try {
            parsedFilter = this.parseFilter(req.query);
        } catch (err) {
            res.status(400).send({error: 'Bad Filter in Request'});
            console.log(err);
            return;
        }

        this.logic.getMany(parsedFilter).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected getPaginatedMany(req: ServerRequest, res: ServerResponse): void {
        let parsedFilter: TEntFilter & EntityPaginationFilter;

        try {
            parsedFilter = this.parsePaginationFilter(req.query);
        } catch (err) {
            res.status(400).send({error: 'Bad Filter in Request'});
            console.log(err);
            return;
        }

        this.logic.getPaginatedMany(parsedFilter).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected create(req: ServerRequest, res: ServerResponse): void {
        let parsedEntity: TEnt;

        try {
            parsedEntity = this.parseEntity(req.body);
        } catch (err) {
            res.status(400).send({error: 'Bad Entity in Request'});
            console.log(err);
            return;
        }

        this.logic.create(parsedEntity).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected update(req: ServerRequest, res: ServerResponse): void {
        let 
            idParsed: TId,
            parsedUpdate: Partial<TEnt>;

        try {
            idParsed = this.parseId(req.params.id);

        } catch (err) {
            res.status(400).send({error: 'Bad ID In Request'});
            console.log(err);
            return;
        }

        try {
            parsedUpdate = this.parsePartialEntity(req.body);
        } catch (err) {
            res.status(400).send({error: 'Bad Update in Request'});
            console.log(err);
            return;
        }

        this.logic.update(
            idParsed,
            parsedUpdate
        ).then(res.send.bind(res)).catch((err) => {
            res.status(500).send({error: 'Internal Server Error'});
            console.error(err);
        });
    }

    protected delete(req: ServerRequest, res: ServerResponse): void {
        let idParsed: TId;

        try {
            idParsed = this.parseId(req.params.id);

        } catch (err) {
            res.status(400).send({error: 'Bad ID In Request'});
            console.log(err);
            return;
        }

        this.logic.delete(idParsed)
            .then(() => res.status(204).send())
            .catch((err) => {
                res.status(500).send({error: 'Internal Server Error'});
                console.error(err);
            });
    }

    parseId(value: unknown): TId {
        if (typeof value !== 'string') {
            throw new Error('Bad ID, not string');
        }

        const idType = this.logic.getIdType();

        let idParsed: TId;

        if (idType === 'string') {
            idParsed = <TId>value;
        } else if (idType === 'number') {
            idParsed = <TId>parseInt(value, 10);

            if (isNaN(<number>idParsed)) {
                throw new Error('Bad ID');
            }
        } else {
            throw new Error('Bad ID Config');
        }

        return idParsed;
    }

    supportsPagination(): boolean {
        return this.paginationEnabled;
    }

    abstract parseEntity(value: unknown): TEnt;
    abstract parseFilter(value: unknown): TEntFilter;
    abstract parsePaginationFilter(value: unknown): TEntFilter & EntityPaginationFilter;
    abstract parsePartialEntity(value: unknown): Partial<TEnt>;

    private logic: EntityLogic<TEnt, TEntFilter, TId>;
    private basePath: string;
    private paginationEnabled: boolean;
}
