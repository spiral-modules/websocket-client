import EventsDispatcher from './eventsDispatcher';
import { IRunner, ITransport } from './transport';
import Connection from './connection';
import { ISFSocketConfig } from './sfSocket';
interface Action {
    action: string;
    id?: string;
    error?: any;
}
export interface ErrorCallbacks {
    refused: (result: Action) => void;
    unavailable: (result: Action) => void;
}
export interface ConnectionCallbacks {
    message: (message: any) => void;
    error: (error: any) => void;
    closed: (reason: any) => void;
}
export default class ConnectionManager extends EventsDispatcher {
    options: ISFSocketConfig;
    state: string;
    connection: Connection | null;
    usingTLS: boolean;
    unavailableTimer: number;
    retryTimer: number;
    transport: ITransport;
    runner: IRunner | null;
    errorCallbacks: ErrorCallbacks;
    connectionCallbacks: ConnectionCallbacks;
    constructor(options: ISFSocketConfig);
    connect(): void;
    send(data: string): boolean;
    sendEvent(name: string, data: string[], channel?: string): boolean;
    disconnect(): void;
    private startConnecting;
    private abortConnecting;
    private disconnectInternally;
    private retryIn;
    private clearRetryTimer;
    private setUnavailableTimer;
    private clearUnavailableTimer;
    private buildConnectionCallbacks;
    private buildErrorCallbacks;
    private setConnection;
    private abandonConnection;
    private updateState;
    private shouldRetry;
}
export {};
//# sourceMappingURL=connectionManager.d.ts.map