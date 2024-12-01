import { UserCredential } from "@rsoi-lab2/library";

export interface LogicOptions {
    authCredential: UserCredential;
}

export type ConfigurableLogic<TLogic> = TLogic & {
    withOptions(options: LogicOptions): ConfigurableLogic<TLogic>;
}
