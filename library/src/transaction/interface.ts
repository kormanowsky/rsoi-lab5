export interface TransactionInit<TState> {
    do(input: TState): TState | Promise<TState>;
    undo(output: TState | null, err: Error): TState | Promise<TState>;
}

export interface TransactionCommitOutput<TState> {
    hasError: boolean;
    error?: Error;
    output: TState;
}