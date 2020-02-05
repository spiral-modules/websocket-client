import CallbackRegistry from './callbackRegistry';
import { ISFSocketEvent } from './sfSocket';
export default class EventsDispatcher {
    callbacks: CallbackRegistry;
    constructor();
    bind(eventName: string, callback: Function, channel?: string): this;
    unbind(eventName: string, callback: Function, channel?: string): this;
    emit(eventName: string, event?: ISFSocketEvent): EventsDispatcher;
}
