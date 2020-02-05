import Connection from './connection';
import TransportConnection, { TransportHooks } from './transportConnection';
import { ISFSocketConfig } from './sfSocket';

export interface IRunner {
  abort: () => void;
}

export interface ITransport {
  connect(callback: Function): IRunner;
}

export default class Transport implements ITransport {
  hooks: TransportHooks;

  name: string;

  options: ISFSocketConfig;

  constructor(name: string, options: ISFSocketConfig) {
    this.options = options || {};

    const scheme = `ws${options.useTLS ? 's' : ''}`;
    const host = options.useTLS ? (`${options.host}:${options.portTLS}`) : (`${options.host}:${options.port}`);

    const url = `${scheme}://${host}/${options.path}`;

    this.hooks = {
      url,
      isInitialized() {
        return Boolean(window.WebSocket/* || window.MozWebSocket */);
      },
      getSocket(socketUrl) {
        const Constructor = window.WebSocket/* || window.MozWebSocket */;
        return new Constructor(socketUrl);
      },
    };
    this.name = name;
  }

  connect(callback: Function) {
    let connected = false;

    const transport = new TransportConnection(
      this.hooks, this.name,
    );

    const onInitialized = () => {
      transport.unbind('initialized', onInitialized);
      transport.connect();
    };

    const unbindListeners = () => {
      transport.unbind('initialized', onInitialized);
      transport.unbind('open', onOpen); // eslint-disable-line no-use-before-define
      transport.unbind('error', onError); // eslint-disable-line no-use-before-define
      transport.unbind('closed', onClosed); // eslint-disable-line no-use-before-define
    };

    const onOpen = () => {
      connected = true;
      unbindListeners();
      const result = new Connection('', transport);
      callback(null, result);
    };

    const onError = (error: any) => { // TODO
      unbindListeners();
      callback(error);
    };
    const onClosed = () => {
      unbindListeners();
    };

    transport.bind('initialized', onInitialized);
    transport.bind('open', onOpen);
    transport.bind('error', onError);
    transport.bind('closed', onClosed);

    transport.initialize();

    return {
      abort: () => {
        if (connected) {
          return;
        }
        unbindListeners();
        transport.close();
      },
    };
  }
}
