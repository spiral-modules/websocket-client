import { UEventCallback } from '../types';
import CallbackRegistry from './CallbackRegistry';
export interface EventWithChannel {
    context: {
        channel: string;
    };
}
export default class EventsDispatcher<EventMap> {
    callbacks: CallbackRegistry<EventMap>;
    bind<K extends keyof EventMap>(eventName: K, callback: UEventCallback<EventMap, K>, channel?: string): this;
    unbind<K extends keyof EventMap>(eventName: K, callback: UEventCallback<EventMap, K>, channel?: string): this;
    emit<K extends keyof EventMap>(eventName: K, event: EventMap[K]): EventsDispatcher<EventMap>;
}
//# sourceMappingURL=EventsDispatcher.d.ts.map