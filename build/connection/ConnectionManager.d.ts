import EventsDispatcher from '../eventdispatcher/EventsDispatcher';
import { ISFSocketConfig, ISFSocketEvent } from '../SFSocket';
import { NamesDict } from '../eventdispatcher/events';
export declare type ConnectionState = 'initialized' | NamesDict.UNAVAILABLE | NamesDict.CONNECTING | NamesDict.CONNECTED | NamesDict.DISCONNECTED;
export interface ConnectionManagerEventMap {
    [NamesDict.CONNECTING]: ISFSocketEvent;
    [NamesDict.DISCONNECTED]: undefined;
    [NamesDict.CONNECTED]: undefined;
    [NamesDict.CHANNEL_JOINED]: string[];
    [NamesDict.CHANNEL_JOIN_FAILED]: string[];
    [NamesDict.CHANNEL_LEFT]: string[];
    [NamesDict.ERROR]: ISFSocketEvent;
    [NamesDict.MESSAGE]: ISFSocketEvent;
    [NamesDict.CLOSED]: ISFSocketEvent;
    [NamesDict.UNAVAILABLE]: undefined;
}
export default class ConnectionManager extends EventsDispatcher<ConnectionManagerEventMap> {
    private options;
    state: ConnectionState;
    private connection;
    private unavailableTimer;
    private retryTimer;
    private transport;
    private runner;
    private errorCallbacks;
    private connectionCallbacks;
    constructor(options: ISFSocketConfig);
    connect(): void;
    send(data: string): boolean;
    sendCommand(name: string, data: any): boolean;
    sendJoin(channels: string[]): boolean;
    sendLeave(channels: string[]): boolean;
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