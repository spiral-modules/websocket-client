import EventsDispatcher from '../EventsDispatcher';
import { ISFSocketEvent } from '../SFSocket';
import TransportConnection from '../TransportConnection';
import { decodeMessage, encodeMessage, prepareCloseAction } from '../messageCodingUtils';
import { EventType } from '../events';

/**
 * Lists events that can be emitted by `Connection` class
 */
export interface ConnectionEventMap {
  [EventType.CLOSED]: ISFSocketEvent,
  [EventType.ERROR]: ISFSocketEvent,
  [EventType.MESSAGE]: ISFSocketEvent,
}

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

  sendEvent(name: string, data: any, channel?: string) : boolean {
    const event: ISFSocketEvent = {
      type: name,
      data,
      error: null,
    };

    if (channel) {
      event.context = { channel };
    }

    return this.send(encodeMessage(event));
  }

  close() {
    if (this.transport) {
      this.transport.close();
    }
  }

  private bindListeners() {
    const unbindListeners = (listeners: any) => { // TODO
      if (!this.transport) return;
      this.transport.unbind(EventType.MESSAGE, listeners.message);
      this.transport.unbind(EventType.ERROR, listeners.error);
      this.transport.unbind(EventType.CLOSED, listeners.closed);
    };

    const listeners = {
      message: (messageEvent: MessageEvent) => {
        let sfSocketEvent = null;
        try {
          sfSocketEvent = decodeMessage(messageEvent.data);
        } catch (e) {
          this.emit(EventType.ERROR, {
            type: 'MessageParseError',
            error: e,
            data: typeof messageEvent === 'string' ? messageEvent : JSON.stringify(messageEvent),
          });
        }

        if (sfSocketEvent) {
          if (sfSocketEvent.type === 'sfSocket:error') {
            this.emit(EventType.ERROR, {
              type: 'sfSocket:error',
              data: sfSocketEvent.data,
              error: null,
            });
          } else {
            this.emit(EventType.MESSAGE, sfSocketEvent);
          }
        }
      },
      error: (error: ISFSocketEvent) => {
        this.emit(EventType.ERROR, {
          ...error,
          type: 'sfSocket:error',
          data: null, // TODO: Are these overrides needed? Check what's being sent here
        });
      },
      closed: (closeEvent: ISFSocketEvent) => { // TODO
        unbindListeners(listeners);

        if (closeEvent && closeEvent.context && closeEvent.context.code) {
          this.handleCloseEvent(closeEvent);
        }

        this.transport = null;
        this.emit(EventType.CLOSED);
      },
    };

    if (!this.transport) return;
    this.transport.bind(EventType.MESSAGE, listeners.message);
    this.transport.bind(EventType.ERROR, listeners.error);
    this.transport.bind(EventType.CLOSED, listeners.closed);
  }

  private handleCloseEvent(closeEvent : ISFSocketEvent) {
    const action = prepareCloseAction(closeEvent);

    if (action.type === 'sfSocket:closed') {
      this.emit(EventType.CLOSED, action);
    } else {
      this.emit(EventType.ERROR, action);
    }
  }
}
