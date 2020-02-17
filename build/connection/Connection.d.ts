import EventsDispatcher from '../eventdispatcher/EventsDispatcher';
import { ISFSocketEvent } from '../SFSocket';
import TransportConnection from '../transport/TransportConnection';
import { NamesDict } from '../eventdispatcher/events';
export interface ConnectionEventMap {
    [NamesDict.CLOSED]: ISFSocketEvent;
    [NamesDict.ERROR]: ISFSocketEvent;
    [NamesDict.MESSAGE]: ISFSocketEvent;
}
export interface EventWithCode {
    context: {
        code: string;
    };
}
export default class Connection extends EventsDispatcher<ConnectionEventMap> {
    id: string;
    transport: TransportConnection | null;
    constructor(id: string, transport: TransportConnection);
    send(data: string): boolean;
    sendEvent(name: string, data: any, channel?: string): boolean;
    close(): void;
    private bindListeners;
    private handleCloseEvent;
}
//# sourceMappingURL=Connection.d.ts.map