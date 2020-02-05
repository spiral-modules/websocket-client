interface ICallback {
  fn: Function;
  channel: string | null;
}

interface ICallbackTable {
  [index: string]: ICallback[];
}

function prefix(name: string): string {
  return `sf:${name}`;
}

export default class CallbackRegistry {
  callbacks: ICallbackTable;

  constructor() {
    this.callbacks = {};
  }

  get(name : string) : ICallback[] {
    return this.callbacks[prefix(name)];
  }

  add(name : string, callback : Function, channel?: string) {
    const prefixedEventName = prefix(name);

    this.callbacks[prefixedEventName] = this.callbacks[prefixedEventName] || [];
    this.callbacks[prefixedEventName].push({
      fn: callback,
      channel: channel || null,
    });
  }

  remove(name?: string, callback?: Function, channel?: string) {
    if (!name && !callback && !channel) {
      this.callbacks = {};
      return;
    }

    const names = name ? [prefix(name)] : Object.keys(this.callbacks);

    if (callback || channel) {
      this.removeCallback(names, callback, channel);
    } else {
      this.removeAllCallbacks(names);
    }
  }

  private removeCallback(names : string[], callback? : Function, channel? : string) {
    names.forEach((name) => {
      const callbacks = this.callbacks[name] || [];

      this.callbacks[name] = callbacks.filter(
        (existedCallback: ICallback) => {
          const isEqualCallback = callback && callback === existedCallback.fn;
          const isEqualChannel = channel && channel === existedCallback.channel;

          return !isEqualCallback && !isEqualChannel;
        },
      );
      if (this.callbacks[name].length === 0) {
        delete this.callbacks[name];
      }
    });
  }

  private removeAllCallbacks(names : string[]) {
    names.forEach((name) => {
      delete this.callbacks[name];
    });
  }
}
