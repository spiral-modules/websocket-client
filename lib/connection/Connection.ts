import EventsDispatcher from './eventsDispatcher';
import {ISFSocketEvent} from './sfSocket';
import TransportConnection from './transportConnection';
import {decodeMessage, encodeMessage, prepareCloseAction} from "./messageCodingUtils";

export default class Connection extends EventsDispatcher {
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

  sendEvent(name : string, data : any, channel?: string) : boolean {
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
      this.transport.unbind('message', listeners.message);
      this.transport.unbind('error', listeners.error);
      this.transport.unbind('closed', listeners.closed);
    };

    const listeners = {
      message: (messageEvent: MessageEvent) => {
        let sfSocketEvent = null;
        try {
          sfSocketEvent = decodeMessage(messageEvent.data);
        } catch (e) {
          this.emit('error', {
            type: 'MessageParseError',
            error: e,
            data: typeof messageEvent === 'string' ? messageEvent : JSON.stringify(messageEvent),
          });
        }

        if (sfSocketEvent) {
          if (sfSocketEvent.type === 'sfSocket:error') {
            this.emit('error', {
              type: 'sfSocket:error',
              data: sfSocketEvent.data,
              error: null,
            });
          } else {
            this.emit('message', sfSocketEvent);
          }
        }
      },
      error: (error: string) => { // TODO
        this.emit('error', {
          type: 'sfSocket:error',
          error,
          data: null,
        });
      },
      closed: (closeEvent: ISFSocketEvent) => { // TODO
        unbindListeners(listeners);

        if (closeEvent && closeEvent.context && closeEvent.context.code) {
          this.handleCloseEvent(closeEvent);
        }

        this.transport = null;
        this.emit('closed');
      },
    };

    if (!this.transport) return;
    this.transport.bind('message', listeners.message);
    this.transport.bind('error', listeners.error);
    this.transport.bind('closed', listeners.closed);
  }

  private handleCloseEvent(closeEvent : ISFSocketEvent) {
    const action = prepareCloseAction(closeEvent);

    if (action.type === 'sfSocket:closed') {
      this.emit('close', action);
    } else {
      this.emit('error', action);
    }
  }
}
