import { UEventCallback } from './types';
import { SFSocket } from './SFSocket';
import ConnectionManager, { ConnectionManagerEventMap } from './connection/ConnectionManager';

export enum ChannelStatus {
  CLOSED = 'closed', // Connection command not yet sent or leave commang
  JOINING = 'joining', // Socket sent join command, server has not responded with OK
  JOINED = 'joined', // Server returned OK for join command
  LEAVING = 'leaving', // Socket sent leave command, server has not responded with OK
  ERROR = 'error', // Last command finished with error
}

export default class Channel {
  name: string;

  private channelStatus: ChannelStatus = ChannelStatus.CLOSED;

  private socket: SFSocket;

  private cMgr: ConnectionManager;

  subscribed: boolean;

  constructor(name: string, socket: SFSocket) {
    this.name = name;
    this.socket = socket;
    this.cMgr = socket.cMgr;
    this.subscribed = false;
  }

  get status() {
    return this.channelStatus;
  }

  join() {
    if (this.subscribed) return;
    this.subscribed = true;
    this.channelStatus = ChannelStatus.JOINING;
    this.cMgr.sendJoin([this.name]);
  }

  subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.socket.subscribe(eventName, callback, this.name);
  }

  unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.socket.unsubscribe(eventName, callback, this.name);
  }

  leave() {
    this.subscribed = false;
    this.channelStatus = ChannelStatus.LEAVING;
    this.cMgr.sendLeave([this.name]);
  }
}
