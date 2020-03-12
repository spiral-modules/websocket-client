import { UEventCallback } from './types';
import Channel from './Channel';
import ConnectionManager, { ConnectionManagerEventMap } from './connection/ConnectionManager';
export interface IChannels {
    [name: string]: Channel;
}
export declare enum SFSocketEventType {
    CONNECTING = "sfSocket:connecting",
    MESSAGE = "sfSocket:message",
    CHANNEL_JOINED = "channel_joined",
    CHANNEL_JOIN_FAILED = "channel_join_failed",
    CHANNEL_LEFT = "channel_left",
    CHANNEL_LEAVE_FAILED = "channel_leave_failed",
    ERROR = "sfSocket:error",
    CLOSED = "sfSocket:closed"
}
export interface ISFSocketConfig {
    host: string;
    port: string | number;
    path: string;
    queryParams?: {
        [key: string]: string;
    };
    unavailableTimeout?: number;
    useTLS?: boolean;
}
export interface ISFSocketEvent {
    type: SFSocketEventType;
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
    private config;
    private channels;
    cMgr: ConnectionManager;
    constructor(options?: ISFSocketConfig);
    connect(): void;
    disconnect(): void;
    sendCommand(cmdName: string, data: any): boolean;
    joinChannelList(channelsNames: string[]): void;
    leaveChannelList(channelNames: string[]): void;
    subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string): ConnectionManager;
    unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string): ConnectionManager;
    joinChannel(chanelName: string, dontJoin?: boolean): Channel;
    leaveChannel(chanelName: string): Channel;
    getChannel(name: string): Channel;
}
//# sourceMappingURL=SFSocket.d.ts.map