import { NamesDict } from './eventdispatcher/events';
import { ISFSocketEvent } from './SFSocket';

/**
 * Some function that is not described how it's functioning
 * TODO: Need to get rid of all functions like this, therefore marked as deprecated by design
 * @deprecated
 */
export type UndescribedCallbackFunction = Function;

export interface ICallback<F = UndescribedCallbackFunction> {
    fn: F;
    channel: string | null;
}

export type UEventCallback<EventMap, K extends keyof EventMap> = (data: EventMap[K]) => any;

export type ICallbackTable<EventMap> = { [key in keyof EventMap]?: Array<ICallback<UEventCallback<EventMap, any>>> };

/**
 * Maps events to what kind of data they provide
 * This also limits which events can be bind in EventDispatcher
 */
export interface SFEventMap {
    [NamesDict.CONNECTING]: ISFSocketEvent,
    [NamesDict.CONNECTED]: undefined,
    [NamesDict.DISCONNECTED]: undefined,
    [NamesDict.UNAVAILABLE]: undefined,
    [NamesDict.MESSAGE]: ISFSocketEvent,
    [NamesDict.ERROR]: ISFSocketEvent,
    [NamesDict.CLOSED]: ISFSocketEvent,
    [NamesDict.INITIALIZED]: undefined,
}
