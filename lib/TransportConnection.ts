import EventsDispatcher from './eventdispatcher/EventsDispatcher';
import { ISFSocketConfig, ISFSocketEvent } from './SFSocket';
import { NamesDict } from './eventdispatcher/events';

export interface ITransportHooks {
  url: string;
  isInitialized(): boolean;
  getSocket(url: string, options?: ISFSocketConfig): WebSocket;
}


/**
 * Lists events that can be emitted by `TransportConnection` class
 */
export interface TransportEventMap {
  [NamesDict.INITIALIZED]: ISFSocketEvent,
  [NamesDict.ERROR]: ISFSocketEvent,
  [NamesDict.MESSAGE]: ISFSocketEvent,
}

export default class TransportConnection extends EventsDispatcher<TransportEventMap> {
  hooks: ITransportHooks;

  name: string;

  state: string;

  socket?: WebSocket;

  initialize: Function;

  constructor(hooks: ITransportHooks, name: string) {
    super();
    this.initialize = () => {
      const self = this;

      if (self.hooks.isInitialized()) {
        self.changeState(NamesDict.INITIALIZED);
      } else {
        self.onClose();
      }
    };
    this.hooks = hooks;
    this.name = name;

    this.state = 'new';
  }

  connect() : boolean {
    if (this.socket || this.state !== 'initialized') {
      return false;
    }

    const { url } = this.hooks;
    try {
      this.socket = this.hooks.getSocket(url);
    } catch (e) {
      // Workaround for MobileSafari bug (see https://gist.github.com/2052006)
      setTimeout(() => {
        this.onError(e);
        this.changeState(NamesDict.CLOSED);
      });
      return false;
    }

    this.bindListeners();
    this.changeState(NamesDict.CONNECTING);
    return true;
  }

  /** Closes the connection.
   *
   * @return {Boolean} true if there was a connection to close
   */
  close() : boolean {
    if (this.socket) {
      this.socket.close();
      return true;
    }
    return false;
  }

  send(data : any) : boolean { // TODO
    if (this.state === 'open') {
      // Workaround for MobileSafari bug (see https://gist.github.com/2052006)
      setTimeout(() => {
        if (this.socket) {
          this.socket.send(data);
        }
      });
      return true;
    }
    return false;
  }

  private unbindListeners() {
    if (!this.socket) return;
    this.socket.onopen = null;
    this.socket.onerror = null;
    this.socket.onclose = null;
    this.socket.onmessage = null;
  }


  private onOpen() {
    this.changeState(NamesDict.OPEN);
    if (!this.socket) return;
    this.socket.onopen = null;
  }

  private onError(error?: string) {
    this.emit(NamesDict.ERROR, {
      type: 'sfSocket:error',
      error: error || 'websocket connection error',
      data: null,
    });
  }

  private onClose(closeEvent?: CloseEvent) {
    if (closeEvent) {
      this.changeState(NamesDict.CLOSED, {
        type: closeEvent.wasClean ? 'sfSocket:closed' : 'sfSocket:error',
        data: closeEvent.wasClean ? closeEvent.reason : null,
        error: closeEvent.wasClean ? null : closeEvent.reason,
        context: {
          code: closeEvent.code,
        },
      });
    } else {
      this.changeState(NamesDict.CLOSED, {
        type: 'sfSocket:closed',
        data: null,
        error: 'Closed for unknown reason',
        context: {},
      });
    }
    this.unbindListeners();
    this.socket = undefined;
  }

  private onMessage(message: MessageEvent) {
    this.emit(NamesDict.MESSAGE, {
      type: 'sfSocket:message',
      data: typeof message.data === 'string' ? message.data : JSON.stringify(message.data),
      error: null,
    });
  }

  private bindListeners() {
    if (!this.socket) return;
    this.socket.onopen = () => {
      this.onOpen();
    };
    this.socket.onerror = () => {
      this.onError();
    };
    this.socket.onclose = (closeEvent: CloseEvent) => {
      this.onClose(closeEvent);
    };
    this.socket.onmessage = (message: MessageEvent) => {
      this.onMessage(message);
    };
  }

  private changeState(state: NamesDict, params?: ISFSocketEvent) {
    this.state = state;
    this.emit(state, params);
  }
}
