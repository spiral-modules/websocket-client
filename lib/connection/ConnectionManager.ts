import { UndescribedCallbackFunction } from '../types';
import {
  IAction,
  IConnectionCallbacks,
  IErrorCallbacks,
} from './types';
import EventsDispatcher from '../eventdispatcher/EventsDispatcher';
import Transport, { IRunner, ITransport } from '../transport/Transport';
import Connection from './Connection';
import { ISFSocketConfig, ISFSocketEvent, SFSocketEventType } from '../SFSocket';

import { NamesDict } from '../eventdispatcher/events';

export type ConnectionState = 'initialized'
    | NamesDict.UNAVAILABLE
    | NamesDict.CONNECTING
    | NamesDict.CONNECTED
    | NamesDict.DISCONNECTED;

export interface ConnectionManagerEventMap {
    [NamesDict.CONNECTING]: ISFSocketEvent,
    [NamesDict.DISCONNECTED]: undefined,
    [NamesDict.CONNECTED]: undefined,
    [NamesDict.ERROR]: ISFSocketEvent,
    [NamesDict.MESSAGE]: ISFSocketEvent,
    [NamesDict.CLOSED]: ISFSocketEvent,
    [NamesDict.UNAVAILABLE]: undefined,
}

export default class ConnectionManager extends EventsDispatcher<ConnectionManagerEventMap> {
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

    constructor(options: ISFSocketConfig) {
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
      this.updateState(NamesDict.CONNECTING);
      this.startConnecting();
      this.setUnavailableTimer();
    }

    send(data: string) {
      if (this.connection) {
        return this.connection.send(data);
      }
      return false;
    }

    sendEvent(name: string, data: string[], channel?: string) {
      if (this.connection) {
        return this.connection.sendEvent(name, data, channel);
      }
      return false;
    }

    disconnect() {
      this.disconnectInternally();
      this.updateState(NamesDict.DISCONNECTED);
    }

    public isConnected() {
      return this.state === NamesDict.CONNECTED;
    }

    private startConnecting() {
      const callback: UndescribedCallbackFunction = (error: Error | undefined | null, connection: Connection) => { // TODO
        if (error) {
          this.runner = this.transport.connect(callback);
        } else {
          this.abortConnecting();

          this.clearUnavailableTimer();
          this.setConnection(connection);
          this.updateState(NamesDict.CONNECTED);
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
        this.emit(NamesDict.CONNECTING, {
          type: SFSocketEventType.CONNECTING,
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
          this.updateState(NamesDict.UNAVAILABLE);
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

    private buildConnectionCallbacks(errorCallbacks: IErrorCallbacks): IConnectionCallbacks {
      return {
        ...errorCallbacks,
        message: (socketEvent: ISFSocketEvent) => {
          // includes pong messages from server
          this.emit(NamesDict.MESSAGE, socketEvent);
        },
        error: (errorEvent: ISFSocketEvent) => {
          // just emit error to user - socket will already be closed by browser
          this.emit(NamesDict.ERROR, errorEvent);
        },
        closed: (closeEvent: ISFSocketEvent) => {
          this.abandonConnection();
          if (this.shouldRetry()) {
            this.retryIn(1000);
          }
          this.emit(NamesDict.CLOSED, closeEvent);
        },
      };
    }

    private buildErrorCallbacks(): IErrorCallbacks {
      const withErrorEmitted = (callback: UndescribedCallbackFunction) => (result: IAction) => {
        if (result.error) {
          this.emit(NamesDict.ERROR, {
            type: SFSocketEventType.ERROR,
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
      this.connection.bind(NamesDict.MESSAGE, this.connectionCallbacks.message);
      this.connection.bind(NamesDict.ERROR, this.connectionCallbacks.error);
      this.connection.bind(NamesDict.CLOSED, this.connectionCallbacks.closed);
    }

    private abandonConnection() {
      if (!this.connection) {
        return null;
      }
      this.connection.unbind(NamesDict.MESSAGE, this.connectionCallbacks.message);
      this.connection.unbind(NamesDict.ERROR, this.connectionCallbacks.error);
      this.connection.unbind(NamesDict.CLOSED, this.connectionCallbacks.closed);

      const { connection } = this;
      this.connection = null;

      return connection;
    }

    private updateState(newState: NamesDict.UNAVAILABLE
        | NamesDict.CONNECTING
        | NamesDict.CONNECTED
        | NamesDict.DISCONNECTED) {
      const previousState = this.state;
      this.state = newState;
      if (previousState !== newState) {
        this.emit(newState, undefined);
      }
    }

    private shouldRetry(): boolean {
      return this.state === NamesDict.CONNECTING || this.state === NamesDict.CONNECTED;
    }
}
