import { UEventCallback } from './types';
import { SFSocket } from './SFSocket';
import { ConnectionManagerEventMap } from './connection/ConnectionManager';
export declare enum ChannelStatus {
    CLOSED = "closed",
    JOINING = "joining",
    JOINED = "joined",
    LEAVING = "leaving",
    ERROR = "error"
}
export default class Channel {
    private readonly selfName;
    private channelStatus;
    private socket;
    private cMgr;
    private enabled;
    constructor(name: string, socket: SFSocket);
    get status(): ChannelStatus;
    get name(): string;
    get isActive(): boolean;
    join(): void;
    subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>): void;
    unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>): void;
    leave(): void;
    private onConnect;
    private onDisconnect;
    private onJoin;
    private onLeft;
    private onJoinFailed;
    private sendJoinCommand;
    private startListening;
    private stopListening;
}
//# sourceMappingURL=Channel.d.ts.map