export interface LogicOptions {
    username: string;
}

export type ConfigurableLogic<TLogic, TLogicOptions = LogicOptions> = TLogic & {
    withOptions(options: TLogicOptions): ConfigurableLogic<TLogic, TLogicOptions>;
}
