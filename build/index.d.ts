import { SFSocket } from './SFSocket';
import { NamesDict as eventNames } from './eventdispatcher/events';
import Channel, { ChannelStatus } from './Channel';
import { ICallback, ICallbackTable, SFEventMap, UEventCallback, UndescribedCallbackFunction } from './types';
declare const makeSocketOptions: (wsUrl: string) => {
    host: string;
    port: string;
    path: string;
} | null;
export { SFSocket, makeSocketOptions, eventNames, Channel, ChannelStatus, ICallback, ICallbackTable, SFEventMap, UEventCallback, UndescribedCallbackFunction, };
//# sourceMappingURL=index.d.ts.map