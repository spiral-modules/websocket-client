import EventsDispatcher from './eventsDispatcher';
import { ISFSocketConfig } from './sfSocket';
export interface TransportHooks {
    url: string;
    isInitialized(): boolean;
    getSocket(url: string, options?: ISFSocketConfig): WebSocket;
}
export default class TransportConnection extends EventsDispatcher {
    hooks: TransportHooks;
    name: string;
    state: string;
    socket?: WebSocket;
    initialize: Function;
    constructor(hooks: TransportHooks, name: string);
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
}
//# sourceMappingURL=transportConnection.d.ts.map