import { UEventCallback } from './types';
import Channel from './Channel';
import ConnectionManager, { ConnectionManagerEventMap } from './connection/ConnectionManager';
import { NamesDict } from './eventdispatcher/events';
import EventsDispatcher from './eventdispatcher/EventsDispatcher';
export interface IChannels {
    [name: string]: Channel;
}
export interface ISFSocketConfig {
    host: string;
    port: string | number;
    portTLS?: string | number;
    path: string;
    unavailableTimeout?: number;
    useTLS?: boolean;
    useStorage?: boolean;
}
export interface ISFSocketEvent {
    type: string;
    data: string | null;
    error: string | null;
    context?: {
        channel?: string;
        code?: string | number;
    } | null;
}
export interface SFSocketEventMap {
    [NamesDict.MESSAGE]: ISFSocketEvent;
}
export declare class SFSocket {
    static instances: SFSocket[];
    static isReady: boolean;
    static ready(): void;
    config: ISFSocketConfig;
    channels: IChannels;
    eventsDispatcher: EventsDispatcher<SFSocketEventMap>;
    connection: ConnectionManager;
    hasStorage: boolean;
    constructor(options?: ISFSocketConfig);
    connect(): void;
    disconnect(): void;
    sendEvent(eventName: string, data: string[], channel?: string): boolean;
    join(data: string[]): boolean;
    leave(data: string[]): boolean;
    listen(channelsNames: string[]): void;
    stopListen(channelNames: string[]): void;
    subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string): ConnectionManager;
    unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string): ConnectionManager;
    channel(channelName: string): Channel;
    addChannel(name: string, socket: SFSocket): Channel;
    joinChannel(chanelName: string): boolean;
    leaveChannel(chanelName: string): boolean;
    findChannel(name: string): Channel;
    private removeChannel;
    private channelsDisconnect;
    private subscribeChannel;
    getStorage(): any;
    addStorageChannel(channelName: string): void;
    removeStorageChannel(channelName: string): void;
    setStorage(args: string[]): void | null;
    clearStorage(): void | null;
}
//# sourceMappingURL=SFSocket.d.ts.map