import { UserCredential, ConfigurableLogic as Super } from "@rsoi-lab2/library";

export interface LogicOptions {
    authCredential: UserCredential;
}

export type ConfigurableLogic<TLogic> = Super<TLogic, LogicOptions>;