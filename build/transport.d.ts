import { TransportHooks } from './transportConnection';
import { ISFSocketConfig } from './sfSocket';
export interface IRunner {
    abort: () => void;
}
export interface ITransport {
    connect(callback: Function): IRunner;
}
export default class Transport implements ITransport {
    hooks: TransportHooks;
    name: string;
    options: ISFSocketConfig;
    constructor(name: string, options: ISFSocketConfig);
    connect(callback: Function): {
        abort: () => void;
    };
}
//# sourceMappingURL=transport.d.ts.map