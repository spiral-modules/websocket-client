import EventsDispatcher from '../eventdispatcher/EventsDispatcher';
import { ISFSocketEvent, SFSocketEventType } from '../SFSocket';
import TransportConnection from '../transport/TransportConnection';
import { decodeMessage, encodeMessage, prepareCloseAction } from '../messageCodingUtils';
import { NamesDict } from '../eventdispatcher/events';

/**
 * Lists events that can be emitted by `Connection` class
 */
export interface ConnectionEventMap {
  [NamesDict.CLOSED]: ISFSocketEvent,
  [NamesDict.ERROR]: ISFSocketEvent,
  [NamesDict.MESSAGE]: ISFSocketEvent,
  [NamesDict.CHANNEL_JOIN_FAILED]: string[],
  [NamesDict.CHANNEL_JOINED]: string[],
  [NamesDict.CHANNEL_LEFT]: string[],
}

export enum ConnectionCommands {
  JOIN = 'join',
  LEAVE = 'leave',
}

export const SystemCommands = new Set<string>([ConnectionCommands.JOIN, ConnectionCommands.LEAVE]);

export interface EventWithCode {
  context: { code: string }
}

const isEventWithCode = (variableToCheck: any): variableToCheck is EventWithCode => (
  variableToCheck.context
    && typeof variableToCheck.context.code !== 'undefined'
);

export default class Connection extends EventsDispatcher<ConnectionEventMap> {
  id: string;

  transport: TransportConnection | null;

  constructor(id : string, transport : TransportConnection) {
    super();
    this.id = id;
    this.transport = transport;
    this.bindListeners();
  }

  send(data : string) : boolean {
    if (!this.transport) return false;
    return this.transport.send(data);
  }

  /**
   * Sends custom command to ws connection
   * @param commandName - command that has custom handler on server
   * @param payload - any serializable data
   */
  sendCommand(commandName: string, payload: any) : boolean {
    if (SystemCommands.has(commandName)) {
      throw new Error(`${commandName} is a reserved command, cant be sent manually`);
    }

    return this.send(encodeMessage({ type: commandName, payload }));
  }

  /**
   * Sends command to join specific channels
   * @param channels
   */
  sendJoin(channels: string[]) {
    this.send(encodeMessage({
      type: ConnectionCommands.JOIN,
      payload: channels,
    }));
  }

  sendLeave(channels: string[]) {
    this.send(encodeMessage({
      type: ConnectionCommands.LEAVE,
      payload: channels,
    }));
  }

  close() {
    if (this.transport) {
      this.transport.close();
    }
  }

  private bindListeners() {
    const unbindListeners = (listeners: any) => { // TODO
      if (!this.transport) return;
      this.transport.unbind(NamesDict.MESSAGE, listeners.message);
      this.transport.unbind(NamesDict.ERROR, listeners.error);
      this.transport.unbind(NamesDict.CLOSED, listeners.closed);
    };

    const listeners = {
      message: (messageEvent: ISFSocketEvent) => {
        let sfSocketEvent = null;
        try {
          sfSocketEvent = decodeMessage(messageEvent.data);
        } catch (e) {
          this.emit(NamesDict.ERROR, {
            type: SFSocketEventType.ERROR,
            error: e,
            data: JSON.stringify(messageEvent),
          });
        }

        if (sfSocketEvent) {
          switch (sfSocketEvent.type) {
            case SFSocketEventType.ERROR:
              this.emit(NamesDict.ERROR, sfSocketEvent);
              break;
            case SFSocketEventType.CHANNEL_JOIN_FAILED:
              this.emit(NamesDict.CHANNEL_JOIN_FAILED, sfSocketEvent.data as any); // TODO:
              break;
            case SFSocketEventType.CHANNEL_JOINED:
              this.emit(NamesDict.CHANNEL_JOINED, sfSocketEvent.data as any); // TODO:
              break;
            case SFSocketEventType.CHANNEL_LEFT:
              this.emit(NamesDict.CHANNEL_LEFT, sfSocketEvent.data as any); // TODO:
              break;
            case SFSocketEventType.CHANNEL_LEAVE_FAILED:
              this.emit(NamesDict.ERROR, sfSocketEvent);
              break;
            default:
              this.emit(NamesDict.MESSAGE, sfSocketEvent);
          }
        }
      },
      error: (error: ISFSocketEvent) => {
        this.emit(NamesDict.ERROR, {
          ...error,
          type: SFSocketEventType.ERROR,
          data: null, // TODO: Are these overrides needed? Check what's being sent here
        });
      },
      closed: (closeEvent: ISFSocketEvent) => { // TODO
        unbindListeners(listeners);

        if (isEventWithCode(closeEvent)) {
          this.handleCloseEvent(closeEvent);
        }

        this.transport = null;
        this.emit(NamesDict.CLOSED, closeEvent);
      },
    };

    if (!this.transport) return;
    this.transport.bind(NamesDict.MESSAGE, listeners.message);
    this.transport.bind(NamesDict.ERROR, listeners.error);
    this.transport.bind(NamesDict.CLOSED, listeners.closed);
  }

  private handleCloseEvent(closeEvent : ISFSocketEvent) {
    const action = prepareCloseAction(closeEvent);

    if (action.type === SFSocketEventType.CLOSED) {
      this.emit(NamesDict.CLOSED, action);
    } else {
      this.emit(NamesDict.ERROR, action);
    }
  }
}
