export const circuitBreakerMaxErrors = 10;

export class CircuitBreakerSwitch {
    constructor(maxErrors = circuitBreakerMaxErrors) {
        this.errorCounter = 0;
        this.maxErrors = maxErrors;
    }

    reportError() {
        this.errorCounter++;
        if (this.errorCounter === this.maxErrors) {
            this.state = 'closed';
        }
    }

    reset() {
        this.errorCounter = 0;
        this.state = 'open';
    }

    isOpen(): boolean {
        return this.state === 'open';
    }

    isClosed(): boolean {
        return this.state === 'closed';
    }

    private errorCounter: number;
    private maxErrors: number;
    private state: 'open' | 'closed' = 'open';
}