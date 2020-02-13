import { EventType } from 'events';

export interface ICallback {
  fn: CallbackFunction;
  channel: string | null;
}

export type ICallbackTable = { [key in EventType]: ICallback[] };

export type CallbackFunction = Function;
