import { TransactionCommitOutput } from "./interface";
import { Transaction } from "./simple";

export class TransactionChain<
    TState = void, 
    TIn extends TState = TState,
    TOut extends TState = TState
> extends Transaction<TIn, TOut> {
    constructor(...chain: Array<Transaction<TState, TState>>){
        super();
        this.chain = chain;
        this.state = null;
        this.lastSuccessfulTransaction = -1;
    }

    add(transaction: Transaction<TState, TState>) {
        this.chain.push(transaction);
    }

    rollback(output: TOut | null, err: Error): Promise<TransactionCommitOutput<TOut>> {
        if (output == null && this.state != null) {
            output = this.stateToOutput(this.state);
        }

        return super.rollback(output, err);
    }

    protected async do(input: TIn): Promise<TOut> {
        this.state = this.inputToState(input);
        this.lastSuccessfulTransaction = -1;
        for(let i = 0; i < this.chain.length; ++i) {
            const output = await this.chain[i].commit(this.state!);
            if (output.error != null) {
                throw output.error;
            } else {
                this.lastSuccessfulTransaction++;
            }
        }

        return this.stateToOutput(this.state);
    }

    protected async undo(output: TOut | null, err: Error): Promise<void> {
        this.state = output ?? this.state;

        for(let i = this.lastSuccessfulTransaction; i >= 0; --i) {
            try {
                await this.chain[i].rollback(this.state, err);
            } catch (error) {
                console.warn('While undo()-ing:');
                console.warn(error);
            }
        }
    }

    protected inputToState(input: TIn): TState {
        return input;
    }

    protected stateToOutput(state: TState): TOut {
        return <TOut>state;
    }

    private chain: Array<Transaction<TState, TState>> = [];
    private lastSuccessfulTransaction: number;
    private state: TState | null;
}
