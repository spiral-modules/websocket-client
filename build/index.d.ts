import { SFSocket, ISFSocketEvent, ISFSocketConfig, SFSocketEventType } from './SFSocket';
import { NamesDict, NamesDict as eventNames } from './eventdispatcher/events';
import Channel, { ChannelStatus } from './Channel';
import { ICallback, ICallbackTable, SFEventMap, UEventCallback, UndescribedCallbackFunction } from './types';
declare const makeSocketOptions: (wsUrl: string) => {
    host: string;
    port: string;
    path: string;
} | null;
export { SFSocket, makeSocketOptions, eventNames, Channel, ChannelStatus, ICallback, ICallbackTable, ISFSocketEvent, NamesDict, ISFSocketConfig, SFSocketEventType, SFEventMap, UEventCallback, UndescribedCallbackFunction, };
//# sourceMappingURL=index.d.ts.map