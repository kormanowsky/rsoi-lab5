import { TransactionCommitOutput, TransactionInit } from './interface';

export class Transaction<TState> {
    constructor(init?: TransactionInit<TState>) {
        if (init != null) {
            this.commitAction = init.do;
            this.rollbackAction = init.undo;
        } else {
            this.commitAction = this.do.bind(this);
            this.rollbackAction = this.undo.bind(this);
        }
    }

    async commit(input: TState): Promise<TransactionCommitOutput<TState>> {
        try {
            const output = await this.commitAction(input);
            
            return {hasError: false, output};
    
        } catch (err) {
            return this.rollback(input, err);
        }
    }

    async rollback(output: TState, err: Error): Promise<TransactionCommitOutput<TState>> {
        try {
            output = await this.rollbackAction(output, err);
        } catch (err) {
            console.warn('While undo()-ing a Transaction:');
            console.warn(err);

            return {hasError: true, output, error: err};
        }

        return {hasError: true, output, error: err};
    }

    protected do(_: TState): Promise<TState> {
        throw new Error('not implemented');
    }

    protected undo(_: TState, __: Error): Promise<TState> {
        throw new Error('not implemented');
    }

    private commitAction: TransactionInit<TState>['do'];
    private rollbackAction: TransactionInit<TState>['undo'];
}
