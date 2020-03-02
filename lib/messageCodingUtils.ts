import { ISFSocketEvent, SFSocketEventType } from './SFSocket';

export enum SystemEvents {
    CHANNEL_JOINED = '@join', // server payload is string[] = channel list that were successfully joined
    CHANNEL_JOIN_FAILED = '#join', // server payload is string[] = channel list that failed to join
    CHANNEL_LEFT = '@leave', // server payload is string[] = channel list that were successfully left
    CHANNEL_LEAVE_FAILED = '#leave', // server payload is string[] = channel list that failed to leave
}

export const SystemTopics = new Set<string>([
  SystemEvents.CHANNEL_JOINED,
  SystemEvents.CHANNEL_JOIN_FAILED,
  SystemEvents.CHANNEL_LEFT,
  SystemEvents.CHANNEL_LEAVE_FAILED,
]);

export const decodeMessage = (messageEvent: string | null): ISFSocketEvent => {
  if (messageEvent) {
    const messageData = JSON.parse(messageEvent);
    if (SystemTopics.has(messageData.topic)) {
      if (!messageData.payload && Array.isArray(messageData.payload)) {
        return {
          type: SFSocketEventType.ERROR,
          error: 'WS event system event payload is invalid. Should be a string array',
          data: 'MessageParseError',
        };
      }
    }
    switch (messageData.topic) {
      case SystemEvents.CHANNEL_JOINED:
        return {
          type: SFSocketEventType.CHANNEL_JOINED,
          error: null,
          data: messageData.payload,
        };
      case SystemEvents.CHANNEL_JOIN_FAILED:
        return {
          type: SFSocketEventType.CHANNEL_JOIN_FAILED,
          error: null,
          data: messageData.payload,
        };
      case SystemEvents.CHANNEL_LEFT:
        return {
          type: SFSocketEventType.CHANNEL_LEFT,
          error: null,
          data: messageData.payload,
        };
      case SystemEvents.CHANNEL_LEAVE_FAILED:
        return {
          type: SFSocketEventType.CHANNEL_LEAVE_FAILED,
          error: null,
          data: messageData.payload,
        };
      default:
        return {
          type: SFSocketEventType.MESSAGE,
          error: null,
          data: messageData.payload || null,
          context: {
            ...(messageData.topic ? { channel: messageData.topic } : {}),
          },
        };
    }
  }

  return {
    type: SFSocketEventType.ERROR,
    error: 'MessageEvent has no data property',
    data: 'MessageParseError',
  };
};

export const encodeMessage = (event: { type: string, payload: any }): string => {
  const sfEvent = {
    topic: event.type,
    payload: event.payload,
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
