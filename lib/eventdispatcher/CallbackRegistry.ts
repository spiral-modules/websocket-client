import {
  ICallback, ICallbackTable, UEventCallback,
} from '../types';

export default class CallbackRegistry<EventMap> {
    callbacks: ICallbackTable<EventMap> = {};

    get<K extends keyof EventMap>(name: K): ICallback[] {
      const results = this.callbacks[name];
      return (results || [])!; // TODO: Why TS wants '!' here?
    }

    add<K extends keyof EventMap>(name: K, callback: UEventCallback<EventMap, K>, channel?: string) {
      if (!this.callbacks[name]) {
        this.callbacks[name] = [];
      }
        this.callbacks[name]!.push({
          fn: callback,
          channel: channel || null,
        });
    }

    remove<K extends keyof EventMap>(name: K, callback: UEventCallback<EventMap, K>, channel?: string) {
      if (!name && !callback && !channel) {
        this.callbacks = {};
        return;
      }

      const names: K[] = name ? [name] : Object.keys(this.callbacks) as K[];

      if (callback || channel) {
        this.removeCallback(names, callback, channel);
      } else {
        this.removeAllCallbacks(names);
      }
    }

    private removeCallback<K extends keyof EventMap>(names: K[], callback?: UEventCallback<EventMap, K>, channel?: string) {
      names.forEach((name) => {
        const callbacks: Array<ICallback<UEventCallback<EventMap, K>>> = (this.callbacks[name] || [])!; // TODO: Why TS wants '!' here?
        this.callbacks[name] = callbacks.filter(
          (existedCallback: ICallback) => {
            const isEqualCallback = callback && callback === existedCallback.fn;
            const isEqualChannel = channel && channel === existedCallback.channel;
            return !isEqualCallback && !isEqualChannel;
          },
        );
      });
    }

    private removeAllCallbacks<K extends keyof EventMap>(names: K[]) {
      names.forEach((name) => {
        delete this.callbacks[name];
      });
    }
}
