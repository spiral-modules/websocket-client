import { NamesDict } from './eventdispatcher/events';
import { ISFSocketEvent } from './SFSocket';
export interface ICallback<F = UndescribedCallbackFunction> {
    fn: F;
    channel: string | null;
}
export declare type ICallbackTable<EventMap> = {
    [key in keyof EventMap]?: Array<ICallback<UEventCallback<EventMap, any>>>;
};
export declare type UndescribedCallbackFunction = Function;
export interface SFEventMap {
    [NamesDict.CONNECTING]: ISFSocketEvent;
    [NamesDict.CONNECTED]: undefined;
    [NamesDict.DISCONNECTED]: undefined;
    [NamesDict.UNAVAILABLE]: undefined;
    [NamesDict.MESSAGE]: ISFSocketEvent;
    [NamesDict.ERROR]: ISFSocketEvent;
    [NamesDict.CLOSED]: ISFSocketEvent;
    [NamesDict.INITIALIZED]: undefined;
}
export declare type EventCallback<K extends keyof SFEventMap> = (data: SFEventMap[K]) => any;
export declare type UEventCallback<EventMap, K extends keyof EventMap> = (data: EventMap[K]) => any;
//# sourceMappingURL=types.d.ts.map