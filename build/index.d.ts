import { SFSocket } from './SFSocket';
import { NamesDict as eventNames } from './eventdispatcher/events';
declare const makeSocketOptions: (wsUrl: string) => {
    host: string;
    port: string;
    path: string;
} | null;
export { SFSocket, makeSocketOptions, eventNames };
export default SFSocket;
//# sourceMappingURL=index.d.ts.map