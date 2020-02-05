import EventsDispatcher from './eventsDispatcher';
import { ISFSocketEvent } from './sfSocket';
import TransportConnection from './transportConnection';

const systemSymbols = ['@'];

export const decodeMessage = (messageEvent : string) : ISFSocketEvent => {
  if (messageEvent) {
    const messageData = JSON.parse(messageEvent);

    const calcChannelName = (topic: string) => {
      let resultTopic = topic;

      systemSymbols.forEach((symbol) => {
        if (topic && topic[0] === symbol) {
          resultTopic = '';
        }
      });

      return String(resultTopic);
    };

    return {
      type: 'sfSocket:message',
      error: null,
      data: messageData.payload || null,
      context: {
        ...(messageData.topic ? { channel: calcChannelName(messageData.topic) } : {}),
      },
    };
  }

  return {
    type: 'MessageParseError',
    error: `messageEvent: ${messageEvent} not contains data property`,
    data: null,
  };
};

const encodeMessage = (event : ISFSocketEvent) : string => {
  const sfEvent = {
    cmd: event.type,
    args: event.data,
  };

  return JSON.stringify(sfEvent);
};

/**
 * See:
 * 1. https://developer.mozilla.org/en-US/docs/WebSockets/WebSockets_reference/CloseEvent
 */
const prepareCloseAction = (closeEvent: ISFSocketEvent) : ISFSocketEvent => {
  if (!closeEvent.context || !closeEvent.context.code) {
    console.error('socket event do not contain close code'); // eslint-disable-line no-console

    return {
      ...closeEvent,
      error: 'connection refused',
    };
  }

  if (closeEvent.context.code < 4000) {
    // ignore 1000 CLOSE_NORMAL, 1001 CLOSE_GOING_AWAY,
    //        1005 CLOSE_NO_STATUS, 1006 CLOSE_ABNORMAL
    // ignore 1007...3999
    // handle 1002 CLOSE_PROTOCOL_ERROR, 1003 CLOSE_UNSUPPORTED,
    //        1004 CLOSE_TOO_LARGE
    if (closeEvent.context.code >= 1002 && closeEvent.context.code <= 1004) {
      return {
        ...closeEvent,
        error: 'socket is unavailable',
      };
    }
  }

  return closeEvent;
};

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
