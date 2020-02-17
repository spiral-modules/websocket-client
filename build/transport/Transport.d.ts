import { UndescribedCallbackFunction } from '../types';
import { ITransportHooks } from './TransportConnection';
import { ISFSocketConfig } from '../SFSocket';
export interface IRunner {
    abort: () => void;
}
export interface ITransport {
    connect(callback: UndescribedCallbackFunction): IRunner;
}
export default class Transport implements ITransport {
    hooks: ITransportHooks;
    name: string;
    options: ISFSocketConfig;
    constructor(name: string, options: ISFSocketConfig);
    connect(callback: UndescribedCallbackFunction): {
        abort: () => void;
    };
}
//# sourceMappingURL=Transport.d.ts.map