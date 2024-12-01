import { LogicOptions } from "./interface";

export function getClientOptsFromLogicOptions(options: LogicOptions): RequestInit {
    if (options.authCredential.type !== 'header') {
        return {};
    }

    return {
        headers: {
            [options.authCredential.headerName]: options.authCredential.headerValue
        }
    }
}
