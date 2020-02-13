import { EventType } from 'events';

export interface ICallback {
    fn: Function;
    channel: string | null;
}

export type ICallbackTable = {[key in EventType]: ICallback[]};
