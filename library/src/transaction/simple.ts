import { TransactionCommitOutput, TransactionInit } from "./interface";

export class Transaction<TIn, TOut> {
    constructor(init?: TransactionInit<TIn, TOut>) {
        if (init != null) {
            this.commitAction = init.do;
            this.rollbackAction = init.undo;
        } else {
            this.commitAction = this.do.bind(this);
            this.rollbackAction = this.undo.bind(this);
        }
    }

    async commit(input: TIn): Promise<TransactionCommitOutput<TOut>> {
        try {
            const output = await this.commitAction(input);
            
            return {hasError: false, output};
    
        } catch (err) {
            return this.rollback(null, err);
        }
    }

    async rollback(output: TOut | null, err: Error): Promise<TransactionCommitOutput<TOut>> {
        try {
            await this.rollbackAction(output, err);
        } catch (err) {
            console.warn('While undo()-ing a Transaction:');
            console.warn(err);

            return {hasError: true, output, error: err};
        }

        return {hasError: true, output, error: err};
    }

    protected do(_: TIn): Promise<TOut> {
        throw new Error('not implemented');
    }

    protected undo(_: TOut | null, __: Error): Promise<void> {
        throw new Error('not implemented');
    }

    private commitAction: TransactionInit<TIn, TOut>['do'];
    private rollbackAction: TransactionInit<TIn, TOut>['undo'];
}
