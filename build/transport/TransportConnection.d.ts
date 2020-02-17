import EventsDispatcher from '../eventdispatcher/EventsDispatcher';
import { ISFSocketConfig, ISFSocketEvent } from '../SFSocket';
import { NamesDict } from '../eventdispatcher/events';
export interface ITransportHooks {
    url: string;
    isInitialized(): boolean;
    getSocket(url: string, options?: ISFSocketConfig): WebSocket;
}
export interface TransportEventMap {
    [NamesDict.INITIALIZED]: undefined;
    [NamesDict.ERROR]: ISFSocketEvent;
    [NamesDict.MESSAGE]: ISFSocketEvent;
    [NamesDict.CLOSED]: ISFSocketEvent;
    [NamesDict.OPEN]: undefined;
    [NamesDict.CONNECTING]: undefined;
}
export default class TransportConnection extends EventsDispatcher<TransportEventMap> {
    hooks: ITransportHooks;
    name: string;
    state: string;
    socket?: WebSocket;
    initialize: Function;
    constructor(hooks: ITransportHooks, name: string);
    connect(): boolean;
    close(): boolean;
    send(data: any): boolean;
    private unbindListeners;
    private onOpen;
    private onError;
    private onClose;
    private onMessage;
    private bindListeners;
    private changeState;
    private onClosed;
}
//# sourceMappingURL=TransportConnection.d.ts.map