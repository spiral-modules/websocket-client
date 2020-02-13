import { CallbackFunction } from './types';
import CallbackRegistry from './CallbackRegistry';
import { ISFSocketEvent } from './SFSocket';
import { EventType } from './events';


export default class EventsDispatcher {
  callbacks: CallbackRegistry;

  constructor() {
    this.callbacks = new CallbackRegistry();
  }

  bind(eventName: EventType, callback: CallbackFunction, channel?: string) {
    this.callbacks.add(eventName, callback, channel);
    return this;
  }

  unbind(eventName: EventType, callback: CallbackFunction, channel?: string) {
    this.callbacks.remove(eventName, callback, channel);
    return this;
  }

  emit(eventName : EventType, event?: ISFSocketEvent) : EventsDispatcher {
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
