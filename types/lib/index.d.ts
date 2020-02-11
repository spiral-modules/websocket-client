import { SFSocket } from './sfSocket';
declare const makeSocketOptions: (wsUrl: string) => {
    host: string;
    port: string;
    path: string;
} | null;
export { SFSocket, makeSocketOptions };
export default SFSocket;
