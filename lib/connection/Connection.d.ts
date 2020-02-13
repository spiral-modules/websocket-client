import EventsDispatcher from '../EventsDispatcher';
import TransportConnection from '../TransportConnection';
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
