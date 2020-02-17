import { UEventCallback } from './types';
import { SFSocket } from './SFSocket';
import { ConnectionManagerEventMap } from './connection/ConnectionManager';
export default class Channel {
    name: string;
    socket: SFSocket;
    subscribed: boolean;
    subscriptionCancelled: boolean;
    constructor(name: string, socket: SFSocket);
    trigger(event: string, data: string[]): boolean;
    disconnect(): void;
    join(): void;
    subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>): void;
    unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>): void;
    leaveChannel(): void;
    cancelSubscription(): void;
    reinstateSubscription(): void;
}
//# sourceMappingURL=Channel.d.ts.map