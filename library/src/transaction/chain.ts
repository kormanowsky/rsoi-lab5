import { Transaction } from './simple';

export class TransactionChain<TState = undefined> extends Transaction<TState> {
    constructor(...chain: Array<Transaction<TState>>){
        super();
        this.chain = chain;
        this.state = null;
        this.lastSuccessfulTransaction = -1;
    }

    add(transaction: Transaction<TState>) {
        this.chain.push(transaction);
    }

    protected async do(input: TState): Promise<TState> {
        this.state = input;
        this.lastSuccessfulTransaction = -1;

        for(let i = 0; i < this.chain.length; ++i) {
            const output = await this.chain[i].commit(this.state!);
            if (output.error != null) {
                throw output.error;
            } else {
                this.lastSuccessfulTransaction++;
            }
        }

        return this.state;
    }

    protected async undo(output: TState, err: Error): Promise<TState> {
        this.state = output;
    
        for(let i = this.lastSuccessfulTransaction; i >= 0; --i) {
            try {
                await this.chain[i].rollback(this.state, err);
            } catch (error) {
                console.warn('While undo()-ing:');
                console.warn(error);
            }
        }

        return this.state;
    }

    private chain: Array<Transaction<TState>> = [];
    private lastSuccessfulTransaction: number;
    private state: TState;
}
