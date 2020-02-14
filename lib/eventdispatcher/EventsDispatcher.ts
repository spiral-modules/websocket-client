import { UEventCallback, ICallback } from '../types';
import CallbackRegistry from './CallbackRegistry';

export interface EventWithChannel {
  context: { channel: string }
}

const isEventWithChannel = (variableToCheck: any): variableToCheck is EventWithChannel => (
  variableToCheck.context
    && typeof variableToCheck.context.channel === 'string'
);

export default class EventsDispatcher<EventMap> {
  callbacks: CallbackRegistry<EventMap> = new CallbackRegistry<EventMap>();

  bind<K extends keyof EventMap>(eventName: K, callback: UEventCallback<EventMap, K>, channel?: string) {
    this.callbacks.add(eventName, callback, channel);
    return this;
  }

  unbind<K extends keyof EventMap>(eventName: K, callback: UEventCallback<EventMap, K>, channel?: string) {
    this.callbacks.remove(eventName, callback, channel);
    return this;
  }

  emit<K extends keyof EventMap>(eventName: K, event: EventMap[K]) : EventsDispatcher<EventMap> {
    const callbacks = this.callbacks.get(eventName);

    const channelEvent: string | null = isEventWithChannel(event) ? event.context.channel
      : null;

    const hasCallbacks = callbacks && callbacks.length > 0;

    if (hasCallbacks) {
      callbacks.forEach((callback: ICallback) => {
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
