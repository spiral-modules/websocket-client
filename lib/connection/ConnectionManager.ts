import { UndescribedCallbackFunction } from '../types';
import {
  IAction,
  IConnectionCallbacks,
  IErrorCallbacks,
} from './types';
import EventsDispatcher from '../EventsDispatcher';
import Transport, { IRunner, ITransport } from '../Transport';
import Connection from './Connection';
import { ISFSocketConfig, ISFSocketEvent } from '../SFSocket';

import { EventType } from '../events';

export enum ConnectionState {
  INITIALIZED = 'initialized',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  CONNECTED = 'connected',
  UNAVAILABLE = 'unavailable',
}

export const StateToEvent: {[key in ConnectionState]: EventType} = {
  [ConnectionState.INITIALIZED]: EventType.INITIALIZED,
  [ConnectionState.CONNECTING]: EventType.CONNECTING,
  [ConnectionState.CONNECTED]: EventType.CONNECTED,
  [ConnectionState.DISCONNECTED]: EventType.DISCONNECTED,
  [ConnectionState.UNAVAILABLE]: EventType.UNAVAILABLE,
};

export default class ConnectionManager extends EventsDispatcher {
  options: ISFSocketConfig;

  state: ConnectionState;

  connection: Connection | null;

  usingTLS: boolean;

  unavailableTimer: number;

  retryTimer: number;

  transport: ITransport;

  runner: IRunner | null;

  errorCallbacks: IErrorCallbacks;

  connectionCallbacks: IConnectionCallbacks;

  constructor(options : ISFSocketConfig) {
    super();
    this.options = options || {};
    this.state = ConnectionState.INITIALIZED;
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
    this.updateState(ConnectionState.CONNECTING);
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
    this.updateState(ConnectionState.DISCONNECTED);
  }

  private startConnecting() {
    const callback: UndescribedCallbackFunction = (error: Error | undefined | null, connection: Connection) => { // TODO
      if (error) {
        this.runner = this.transport.connect(callback);
      } else {
        this.abortConnecting();

        this.clearUnavailableTimer();
        this.setConnection(connection);
        this.updateState(ConnectionState.CONNECTED);
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
      this.emit(EventType.CONNECTING, {
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
        this.updateState(ConnectionState.UNAVAILABLE);
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

  private buildConnectionCallbacks(errorCallbacks: IErrorCallbacks) : IConnectionCallbacks {
    return {
      ...errorCallbacks,
      message: (socketEvent: ISFSocketEvent) => {
      // includes pong messages from server
        this.emit(EventType.MESSAGE, socketEvent);
      },
      error: (errorEvent: ISFSocketEvent) => {
      // just emit error to user - socket will already be closed by browser
        this.emit(EventType.ERROR, errorEvent);
      },
      closed: (closeEvent: ISFSocketEvent) => {
        this.abandonConnection();
        if (this.shouldRetry()) {
          this.retryIn(1000);
        }
        this.emit(EventType.CLOSED, closeEvent);
      },
    };
  }

  private buildErrorCallbacks() : IErrorCallbacks {
    const withErrorEmitted = (callback: UndescribedCallbackFunction) => (result: IAction) => {
      if (result.error) {
        this.emit(EventType.ERROR, {
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
    this.connection.bind(EventType.MESSAGE, this.connectionCallbacks.message);
    this.connection.bind(EventType.ERROR, this.connectionCallbacks.error);
    this.connection.bind(EventType.CLOSED, this.connectionCallbacks.closed);
  }

  private abandonConnection() {
    if (!this.connection) {
      return null;
    }
    this.connection.unbind(EventType.MESSAGE, this.connectionCallbacks.message);
    this.connection.unbind(EventType.ERROR, this.connectionCallbacks.error);
    this.connection.unbind(EventType.CLOSED, this.connectionCallbacks.closed);

    const { connection } = this;
    this.connection = null;

    return connection;
  }

  private updateState(newState : ConnectionState) {
    const previousState = this.state;
    this.state = newState;
    if (previousState !== newState) {
      this.emit(StateToEvent[newState] as any, undefined); // TODO: Type guard StateToEvent properly
    }
  }

  private shouldRetry() : boolean {
    return this.state === ConnectionState.CONNECTING || this.state === ConnectionState.CONNECTED;
  }
}
