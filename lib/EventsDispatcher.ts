import {UndescribedCallbackFunction, SFEventMap, EventCallback} from './types';
import CallbackRegistry from './CallbackRegistry';
import { ISFSocketEvent } from './SFSocket';
import { EventType } from './events';


export default class EventsDispatcher<EventMap> {
  callbacks: CallbackRegistry = new CallbackRegistry<EventMap>();

  bind<K extends keyof EventMap>(eventName: K, callback: EventCallback<K>, channel?: string) {
    this.callbacks.add(eventName, callback, channel);
    return this;
  }

  unbind<K extends keyof EventMap>(eventName: K, callback: EventCallback<K>, channel?: string) {
    this.callbacks.remove(eventName, callback, channel);
    return this;
  }

  emit<K extends keyof SFEventMap>(eventName: K, event: SFEventMap[K]) : EventsDispatcher<EventMap> {
    const callbacks = this.callbacks.get(eventName);

    const channelEvent: string | null | undefined = event && event.context
      ? event.context.channel
      : null;

    const hasCallbacks = callbacks && callbacks.length > 0;

    if (hasCallbacks) {
      callbacks.forEach((callback) => {
        const isChannelCallback = callback.channel === channelEvent;
        const isGlobalCallback = !callback.channel || !channelEvent;

        if (isGlobalCallback || isChannelCallback) {
          callback.fn(event);
        }
      });
    }

    return this;
  }
}
