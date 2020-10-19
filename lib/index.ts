import {
  SFSocket,
  ISFSocketEvent,
  ISFSocketConfig,
  SFSocketEventType,
} from './SFSocket';

import { NamesDict, NamesDict as eventNames } from './eventdispatcher/events';
import Channel, { ChannelStatus } from './Channel';
import {
  ICallback, ICallbackTable, SFEventMap, UEventCallback, UndescribedCallbackFunction,
} from './types';

const makeSocketOptions = (wsUrl: string) => {
  const url = new URL(wsUrl);
  const urlProtocol = url.protocol ? url.protocol.replace(':', '') : null;

  if (url.hostname && url.port && urlProtocol) {
    return {
      host: url.hostname, // host: 'localhost',
      port: url.port, // port: '8080',
      path: urlProtocol, // path: 'ws',
    };
  }

  return null;
};

export {
  SFSocket,
  makeSocketOptions,
  eventNames,
  Channel,
  ChannelStatus,
  ICallback,
  ICallbackTable,
  ISFSocketEvent,
  NamesDict,
  ISFSocketConfig,
  SFSocketEventType,
  SFEventMap,
  UEventCallback,
  UndescribedCallbackFunction,
};
