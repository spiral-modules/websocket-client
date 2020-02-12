import EventsDispatcher from './eventsDispatcher';
import Transport, { IRunner, ITransport } from './transport';
import Connection from './connection';
import { ISFSocketConfig, ISFSocketEvent } from './sfSocket';

interface Action {
  action: string;
  id?: string;
  error?: any; // TODO
}

export interface ErrorCallbacks {
  refused: (result: Action) => void;
  unavailable: (result: Action) => void;
}

export interface ConnectionCallbacks {
  message: (message: any) => void; // TODO
  error: (error: any) => void; // TODO
  closed: (reason: any) => void; // TODO
}

export default class ConnectionManager extends EventsDispatcher {
  options: ISFSocketConfig;

  state: string;

  connection: Connection | null;

  usingTLS: boolean;

  unavailableTimer: number;

  retryTimer: number;

  transport: ITransport;

  runner: IRunner | null;

  errorCallbacks: ErrorCallbacks;

  connectionCallbacks: ConnectionCallbacks;

  constructor(options : ISFSocketConfig) {
    super();
    this.options = options || {};
    this.state = 'initialized';
    this.connection = null;
    this.usingTLS = Boolean(options.useTLS);

    this.errorCallbacks = this.buildErrorCallbacks();
    this.connectionCallbacks = this.buildConnectionCallbacks(this.errorCallbacks);

    this.transport = new Transport(
      'ws',
      options,
    );
    this.runner = null;

    this.unavailableTimer = 0;
    this.retryTimer = 0;
  }

  connect() {
    if (this.connection || this.runner) {
      return;
    }
    this.updateState('connecting');
    this.startConnecting();
    this.setUnavailableTimer();
  }

  send(data: string) {
    if (this.connection) {
      return this.connection.send(data);
    }
    return false;
  }

  sendEvent(name : string, data : string[], channel?: string) {
    if (this.connection) {
      return this.connection.sendEvent(name, data, channel);
    }
    return false;
  }

  disconnect() {
    this.disconnectInternally();
    this.updateState('disconnected');
  }

  private startConnecting() {
    const callback = (error: any, connection: Connection) => { // TODO
      if (error) {
        this.runner = this.transport.connect(callback);
      } else {
        this.abortConnecting();

        this.clearUnavailableTimer();
        this.setConnection(connection);
        this.updateState('connected');
      }
    };
    this.runner = this.transport.connect(callback);
  }

  private abortConnecting() {
    if (this.runner) {
      this.runner.abort();
      this.runner = null;
    }
  }

  private disconnectInternally() {
    this.abortConnecting();
    this.clearRetryTimer();
    this.clearUnavailableTimer();
    if (this.connection) {
      const connection = this.abandonConnection();
      if (connection) connection.close();
    }
  }

  private retryIn(delay: number) {
    if (delay > 0) {
      this.emit('connecting', {
        type: 'sfSocket:connecting',
        data: String(Math.round(delay / 1000)),
        error: null,
      });
    }
    this.retryTimer = setTimeout(() => {
      this.disconnectInternally();
      this.connect();
    }, delay || 0);
  }

  private clearRetryTimer() {
    if (this.retryTimer) {
      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
      }
      this.retryTimer = 0;
    }
  }

  private setUnavailableTimer() {
    this.unavailableTimer = setTimeout(
      () => {
        this.updateState('unavailable');
      },
      this.options.unavailableTimeout,
    );
  }

  private clearUnavailableTimer() {
    if (this.unavailableTimer) {
      clearTimeout(this.unavailableTimer);
    }
    this.unavailableTimer = 0;
  }

  private buildConnectionCallbacks(errorCallbacks: ErrorCallbacks) : ConnectionCallbacks {
    return {
      ...errorCallbacks,
      message: (socketEvent: ISFSocketEvent) => {
      // includes pong messages from server
        this.emit('message', socketEvent);
      },
      error: (errorEvent: ISFSocketEvent) => {
      // just emit error to user - socket will already be closed by browser
        this.emit('error', errorEvent);
      },
      closed: (closeEvent: ISFSocketEvent) => {
        this.abandonConnection();
        if (this.shouldRetry()) {
          this.retryIn(1000);
        }
        this.emit('closed', closeEvent);
      },
    };
  }

  private buildErrorCallbacks() : ErrorCallbacks {
    const withErrorEmitted = (callback: Function) => (result: Action) => {
      if (result.error) {
        this.emit('error', {
          type: 'sfSocket:error',
          data: null,
          error: result.error,
        });
      }
      callback(result);
    };

    return {
      refused: withErrorEmitted(() => {
        this.disconnect();
      }),
      unavailable: withErrorEmitted(() => {
        this.retryIn(1000);
      }),
    };
  }

  private setConnection(connection: Connection | null) {
    this.connection = connection;
    if (!this.connection) {
      return;
    }
    this.connection.bind('message', this.connectionCallbacks.message);
    this.connection.bind('error', this.connectionCallbacks.error);
    this.connection.bind('closed', this.connectionCallbacks.closed);
  }

  private abandonConnection() {
    if (!this.connection) {
      return null;
    }
    this.connection.unbind('message', this.connectionCallbacks.message);
    this.connection.unbind('error', this.connectionCallbacks.error);
    this.connection.unbind('closed', this.connectionCallbacks.closed);

    const { connection } = this;
    this.connection = null;

    return connection;
  }

  private updateState(newState : string) {
    const previousState = this.state;
    this.state = newState;
    if (previousState !== newState) {
      this.emit(newState);
    }
  }

  private shouldRetry() : boolean {
    return this.state === 'connecting' || this.state === 'connected';
  }
}
