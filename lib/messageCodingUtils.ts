import { ISFSocketEvent, SFSocketEventType } from './SFSocket';

const systemSymbols = ['@'];

export const decodeMessage = (messageEvent: string | null): ISFSocketEvent => {
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
      type: SFSocketEventType.MESSAGE,
      error: null,
      data: messageData.payload || null,
      context: {
        ...(messageData.topic ? { channel: calcChannelName(messageData.topic) } : {}),
      },
    };
  }

  return {
    type: SFSocketEventType.ERROR,
    error: 'MessageEvent has no data property',
    data: 'MessageParseError',
  };
};

export const encodeMessage = (event: ISFSocketEvent): string => {
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
export const prepareCloseAction = (closeEvent: ISFSocketEvent): ISFSocketEvent => {
  if (!closeEvent.context || !closeEvent.context.code) {
    console.error('Socket event do not contain close code'); // eslint-disable-line no-console

    return {
      ...closeEvent,
      error: 'Connection refused',
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
        error: 'Socket is unavailable',
      };
    }
  }

  return closeEvent;
};
