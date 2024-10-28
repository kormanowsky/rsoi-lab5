import { CircuitBreakerRegistration } from "./interface";
import { circuitBreakerMaxErrors, CircuitBreakerSwitch } from "./switch";

export class CircuitBreaker {
    constructor() {
        this.registrations = {};
    }

    register<TArgs extends unknown[] = [], TResult = void>(registration: CircuitBreakerRegistration<TArgs, TResult>): void {
        this.registrations[registration.id] = {
            ...registration,
            switch: registration.switch ?? new CircuitBreakerSwitch(registration.maxErrors ?? circuitBreakerMaxErrors),
            maxErrors: registration.maxErrors ?? circuitBreakerMaxErrors,
            restoreDelay: registration.restoreDelay ?? 5000
        };
    }

    dispatch<TArgs extends unknown[] = [], TResult = void>(id: string, ...args: TArgs): TResult {
        if (!this.registrations.hasOwnProperty(id)) {
            throw new Error('CircuitBreaker failed: no such operation');
        }

        const registration = <Required<CircuitBreakerRegistration<TArgs, TResult>>>this.registrations[id];

        if (registration.switch.isClosed()) {
            return registration.fallbackOperation(...args);
        }

        try {
            return registration.realOperation(...args);

        } catch (err) {
            registration.switch.reportError();

            if (registration.switch.isClosed()) { 

                setTimeout(async () => {
                    try {
                        await registration.realOperation(...args);
                        registration.switch.reset();

                    } catch (err) {
                        console.warn(`While restoring operation: ${id}`);
                        console.warn(err);
                    }
                }, registration.restoreDelay);

            }

            return registration.fallbackOperation(...args);
        }
    }

    private registrations: Record<string, Required<CircuitBreakerRegistration>>; 
}
