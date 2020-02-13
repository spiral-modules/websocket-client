import { CallbackFunction, ICallback, ICallbackTable } from './types';
import { EventType } from './events';

const allTypes = [
  EventType.MESSAGE,
  EventType.ERROR,
  EventType.CONNECTED,
  EventType.DISCONNECTED,
  EventType.CONNECTING,
  EventType.OPEN,
  EventType.CLOSED,
  EventType.UNAVAILABLE,
];

export default class CallbackRegistry {
    callbacks: ICallbackTable = {
      [EventType.MESSAGE]: [],
      [EventType.ERROR]: [],
      [EventType.CONNECTED]: [],
      [EventType.DISCONNECTED]: [],
      [EventType.CONNECTING]: [],
      [EventType.INITIALIZED]: [],
      [EventType.UNAVAILABLE]: [],
      [EventType.OPEN]: [],
      [EventType.CLOSED]: [],
    };

    get(name: EventType): ICallback[] {
      return this.callbacks[name];
    }

    add(name: EventType, callback: CallbackFunction, channel?: string) {
      this.callbacks[name].push({
        fn: callback,
        channel: channel || null,
      });
    }

    remove(name: EventType, callback?: CallbackFunction, channel?: string) {
      if (!name && !callback && !channel) {
        this.callbacks = {
          [EventType.MESSAGE]: [],
          [EventType.ERROR]: [],
          [EventType.CONNECTED]: [],
          [EventType.DISCONNECTED]: [],
          [EventType.CONNECTING]: [],
          [EventType.INITIALIZED]: [],
          [EventType.UNAVAILABLE]: [],
          [EventType.OPEN]: [],
          [EventType.CLOSED]: [],
        };
        return;
      }

      const names = name ? [name] : allTypes;

      if (callback || channel) {
        this.removeCallback(names, callback, channel);
      } else {
        this.removeAllCallbacks(names);
      }
    }

    private removeCallback(names: EventType[], callback?: CallbackFunction, channel?: string) {
      names.forEach((name) => {
        const callbacks = this.callbacks[name] || [];
        this.callbacks[name] = callbacks.filter(
          (existedCallback: ICallback) => {
            const isEqualCallback = callback && callback === existedCallback.fn;
            const isEqualChannel = channel && channel === existedCallback.channel;
            return !isEqualCallback && !isEqualChannel;
          },
        );
      });
    }

    private removeAllCallbacks(names: EventType[]) {
      names.forEach((name) => {
        this.callbacks[name] = [];
      });
    }
}
