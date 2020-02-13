import Channel from './channel';
import EventsDispatcher from './eventsDispatcher';
import ConnectionManager from './connectionManager';
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
export declare class SFSocket {
    static instances: SFSocket[];
    static isReady: boolean;
    static ready(): void;
    config: ISFSocketConfig;
    channels: IChannels;
    eventsDispatcher: EventsDispatcher;
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
    subscribe(eventName: string, data: any, channel?: string): ConnectionManager;
    unsubscribe(eventName: string, data: any, channel?: string): ConnectionManager;
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
//# sourceMappingURL=sfSocket.d.ts.map