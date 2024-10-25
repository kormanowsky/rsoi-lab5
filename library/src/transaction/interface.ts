export interface TransactionInit<TIn, TOut> {
    do(input: TIn): TOut | Promise<TOut>;
    undo(output: TOut | null, err: Error): void | Promise<void>;
}

export interface TransactionCommitOutput<TOut> {
    hasError: boolean;
    error?: Error;
    output: TOut | null;
}