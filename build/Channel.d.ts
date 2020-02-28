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
    name: string;
    private channelStatus;
    private socket;
    private cMgr;
    enabled: boolean;
    constructor(name: string, socket: SFSocket);
    get status(): ChannelStatus;
    get isActive(): boolean;
    join(): void;
    private sendJoinCommand;
    subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>): void;
    unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>): void;
    leave(): void;
}
//# sourceMappingURL=Channel.d.ts.map