import EventsDispatcher from '../eventdispatcher/EventsDispatcher';
import { ISFSocketEvent } from '../SFSocket';
import TransportConnection from '../transport/TransportConnection';
import { NamesDict } from '../eventdispatcher/events';
export interface ConnectionEventMap {
    [NamesDict.CLOSED]: ISFSocketEvent;
    [NamesDict.ERROR]: ISFSocketEvent;
    [NamesDict.MESSAGE]: ISFSocketEvent;
    [NamesDict.CHANNEL_JOIN_FAILED]: string[];
    [NamesDict.CHANNEL_JOINED]: string[];
    [NamesDict.CHANNEL_LEFT]: string[];
}
export declare enum ConnectionCommands {
    JOIN = "join",
    LEAVE = "leave"
}
export declare const SystemCommands: Set<string>;
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
    sendCommand(commandName: string, payload: any): boolean;
    sendJoin(channels: string[]): void;
    sendLeave(channels: string[]): void;
    close(): void;
    private bindListeners;
    private handleCloseEvent;
}
//# sourceMappingURL=Connection.d.ts.map