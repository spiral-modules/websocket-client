import { defaultConfig } from '../constants';
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
  [NamesDict.CHANNEL_JOINED]: string[],
  [NamesDict.CHANNEL_JOIN_FAILED]: string[],
  [NamesDict.CHANNEL_LEFT]: string[],
  [NamesDict.ERROR]: ISFSocketEvent,
  [NamesDict.MESSAGE]: ISFSocketEvent,
  [NamesDict.CLOSED]: ISFSocketEvent,
  [NamesDict.UNAVAILABLE]: undefined,
}

export default class ConnectionManager extends EventsDispatcher<ConnectionManagerEventMap> {
  private options: ISFSocketConfig;

  state: ConnectionState;

  private connection: Connection | null;

  private unavailableTimer: NodeJS.Timeout | null;

  private retryTimer: NodeJS.Timeout | null;

  private transport: ITransport;

  private runner: IRunner | null;

  private errorCallbacks: IErrorCallbacks;

  private connectionCallbacks: IConnectionCallbacks;

  constructor(options: ISFSocketConfig) {
    super();
    this.options = { ...defaultConfig, ...options };
    this.state = 'initialized';
    this.connection = null;

    this.errorCallbacks = this.buildErrorCallbacks();
    this.connectionCallbacks = this.buildConnectionCallbacks(this.errorCallbacks);

    this.transport = new Transport(
      'ws',
      options,
    );
    this.runner = null;

    this.unavailableTimer = null;
    this.retryTimer = null;
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

  sendCommand(name: string, data: any) {
    if (this.connection) {
      return this.connection.sendCommand(name, data);
    }
    return false;
  }

  sendJoin(channels: string[]) {
    if (this.connection) {
      this.connection.sendJoin(channels);
    }
    return false;
  }

  sendLeave(channels: string[]) {
    if (this.connection) {
      this.connection.sendLeave(channels);
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
    const callback: UndescribedCallbackFunction = (closeEvent: ISFSocketEvent | undefined, connection: Connection) => { // TODO
      if (closeEvent) {
        this.abandonConnection();
        if (this.shouldRetry(closeEvent)) {
          this.retryIn(this.options.retryTimeout || 0);
        }
        this.emit(NamesDict.CLOSED, closeEvent);
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
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
    }
    this.retryTimer = null;
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
    if (this.unavailableTimer !== null) {
      clearTimeout(this.unavailableTimer);
    }
    this.unavailableTimer = null;
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
        if (this.shouldRetry(closeEvent)) {
          this.retryIn(this.options.retryTimeout || 0);
        }
        this.emit(NamesDict.CLOSED, closeEvent);
      },
      channelJoined: ((channels) => this.emit(NamesDict.CHANNEL_JOINED, channels)),
      channelJoinFailed: ((channels) => this.emit(NamesDict.CHANNEL_JOIN_FAILED, channels)),
      channelLeft: ((channels) => this.emit(NamesDict.CHANNEL_LEFT, channels)),
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
    this.connection.bind(NamesDict.CHANNEL_LEFT, this.connectionCallbacks.channelLeft);
    this.connection.bind(NamesDict.CHANNEL_JOIN_FAILED, this.connectionCallbacks.channelJoinFailed);
    this.connection.bind(NamesDict.CHANNEL_JOINED, this.connectionCallbacks.channelJoined);
    this.connection.bind(NamesDict.ERROR, this.connectionCallbacks.error);
    this.connection.bind(NamesDict.CLOSED, this.connectionCallbacks.closed);
  }

  private abandonConnection() {
    if (!this.connection) {
      return null;
    }
    this.connection.unbind(NamesDict.MESSAGE, this.connectionCallbacks.message);
    this.connection.unbind(NamesDict.CHANNEL_LEFT, this.connectionCallbacks.channelLeft);
    this.connection.unbind(NamesDict.CHANNEL_JOIN_FAILED, this.connectionCallbacks.channelJoinFailed);
    this.connection.unbind(NamesDict.CHANNEL_JOINED, this.connectionCallbacks.channelJoined);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private shouldRetry(closeEvent: ISFSocketEvent): boolean {
    return this.state === NamesDict.CONNECTING || this.state === NamesDict.CONNECTED;
  }
}
