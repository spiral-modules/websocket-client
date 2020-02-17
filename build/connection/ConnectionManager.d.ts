import { IConnectionCallbacks, IErrorCallbacks } from './types';
import EventsDispatcher from '../eventdispatcher/EventsDispatcher';
import { IRunner, ITransport } from '../transport/Transport';
import Connection from './Connection';
import { ISFSocketConfig, ISFSocketEvent } from '../SFSocket';
import { NamesDict } from '../eventdispatcher/events';
export declare type ConnectionState = 'initialized' | NamesDict.UNAVAILABLE | NamesDict.CONNECTING | NamesDict.CONNECTED | NamesDict.DISCONNECTED;
export interface ConnectionManagerEventMap {
    [NamesDict.CONNECTING]: ISFSocketEvent;
    [NamesDict.DISCONNECTED]: undefined;
    [NamesDict.CONNECTED]: undefined;
    [NamesDict.ERROR]: ISFSocketEvent;
    [NamesDict.MESSAGE]: ISFSocketEvent;
    [NamesDict.CLOSED]: ISFSocketEvent;
    [NamesDict.UNAVAILABLE]: undefined;
}
export default class ConnectionManager extends EventsDispatcher<ConnectionManagerEventMap> {
    options: ISFSocketConfig;
    state: ConnectionState;
    connection: Connection | null;
    usingTLS: boolean;
    unavailableTimer: number;
    retryTimer: number;
    transport: ITransport;
    runner: IRunner | null;
    errorCallbacks: IErrorCallbacks;
    connectionCallbacks: IConnectionCallbacks;
    constructor(options: ISFSocketConfig);
    connect(): void;
    send(data: string): boolean;
    sendEvent(name: string, data: string[], channel?: string): boolean;
    disconnect(): void;
    isConnected(): boolean;
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
//# sourceMappingURL=ConnectionManager.d.ts.map