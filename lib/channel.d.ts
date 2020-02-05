import EventsDispatcher from './eventsDispatcher';
import { SFSocket } from './sfSocket';
export default class Channel extends EventsDispatcher {
    name: string;
    socket: SFSocket;
    subscribed: boolean;
    subscriptionCancelled: boolean;
    constructor(name: string, socket: SFSocket);
    trigger(event: string, data: any): boolean;
    disconnect(): void;
    join(): void;
    subscribe(eventName: string, data: any): void;
    unsubscribe(eventName: string, data: any): void;
    leaveChannel(): void;
    cancelSubscription(): void;
    reinstateSubscription(): void;
}
