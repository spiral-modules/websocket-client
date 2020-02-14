import { EventType } from 'eventdispatcher/events';
import { ISFSocketEvent } from './SFSocket';

export interface ICallback<F = UndescribedCallbackFunction> {
    fn: F;
    channel: string | null;
}

export type ICallbackTable<EventMap> = { [key in keyof EventMap]?: Array<ICallback<UEventCallback<EventMap, any>>> };

/**
 * Some function that is not described how it's functioning
 * TODO: Need to get rid of all functions like this, therefore marked as deprecated by design
 * @deprecated
 */
export type UndescribedCallbackFunction = Function;

/**
 * Maps events to what kind of data they provide
 * This also limits which events can be bind in EventDispatcher
 */
export interface SFEventMap {
    [EventType.CONNECTING]: ISFSocketEvent,
    [EventType.CONNECTED]: undefined,
    [EventType.DISCONNECTED]: undefined,
    [EventType.UNAVAILABLE]: undefined,
    [EventType.MESSAGE]: ISFSocketEvent,
    [EventType.ERROR]: ISFSocketEvent,
    [EventType.CLOSED]: ISFSocketEvent,
    [EventType.INITIALIZED]: undefined,
}

export type EventCallback<K extends keyof SFEventMap> = (data: SFEventMap[K]) => any;

export type UEventCallback<EventMap, K extends keyof EventMap> = (data: EventMap[K]) => any;
