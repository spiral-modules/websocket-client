import EventsDispatcher from './eventsDispatcher';
import { ISFSocketEvent } from './sfSocket';
import TransportConnection from './transportConnection';
export declare const decodeMessage: (messageEvent: string) => ISFSocketEvent;
export default class Connection extends EventsDispatcher {
    id: string;
    transport: TransportConnection | null;
    constructor(id: string, transport: TransportConnection);
    send(data: string): boolean;
    sendEvent(name: string, data: any, channel?: string): boolean;
    close(): void;
    private bindListeners;
    private handleCloseEvent;
}
