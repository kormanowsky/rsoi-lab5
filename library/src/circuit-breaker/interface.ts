import { CircuitBreakerSwitch } from "./switch";

export type CircuitBreakerOperation<TArgs extends unknown[] = [], TResult = void> = (...args: TArgs) => TResult;

export interface CircuitBreakerRegistration<TArgs extends unknown[] = [], TResult =  void> {
    id: string;
    switch?: CircuitBreakerSwitch;
    maxErrors?: number;
    restoreDelay?: number;
    realOperation: CircuitBreakerOperation<TArgs,TResult>;
    fallbackOperation: CircuitBreakerOperation<TArgs, TResult>;
}