import { UndescribedCallbackFunction } from './types';
import Connection from './connection/Connection';
import TransportConnection, { ITransportHooks } from './TransportConnection';
import { ISFSocketConfig } from './SFSocket';
import { EventType } from './eventdispatcher/events';

export interface IRunner {
  abort: () => void;
}

export interface ITransport {
  connect(callback: UndescribedCallbackFunction): IRunner;
}

export default class Transport implements ITransport {
  hooks: ITransportHooks;

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
        return !!window.WebSocket;
      },
      getSocket(socketUrl) {
        return new WebSocket(socketUrl);
      },
    };
    this.name = name;
  }

  connect(callback: UndescribedCallbackFunction) {
    let connected = false;

    const transport = new TransportConnection(
      this.hooks, this.name,
    );

    const onInitialized = () => {
      transport.unbind(EventType.INITIALIZED, onInitialized);
      transport.connect();
    };

    const unbindListeners = () => {
      transport.unbind(EventType.INITIALIZED, onInitialized);
      // eslint-disable-next-line no-use-before-define
      transport.unbind(EventType.OPEN, onOpen);
      // eslint-disable-next-line no-use-before-define
      transport.unbind(EventType.ERROR, onError);
      // eslint-disable-next-line no-use-before-define
      transport.unbind(EventType.CLOSED, onClosed);
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

    transport.bind(EventType.INITIALIZED, onInitialized);
    transport.bind(EventType.OPEN, onOpen);
    transport.bind(EventType.ERROR, onError);
    transport.bind(EventType.CLOSED, onClosed);

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
