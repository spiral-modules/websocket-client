import { UEventCallback } from './types';
import { SFSocket } from './SFSocket';
import { ConnectionManagerEventMap } from './connection/ConnectionManager';

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

  subscribed: boolean;

  constructor(name: string, socket: SFSocket) {
    this.name = name;
    this.socket = socket;
    this.subscribed = false;
  }

  get status() {
    return this.channelStatus;
  }

  /**
   * Sends custom event to this channel on server
   * @param customEvent
   * @param payload any serializable payload
   */
  trigger(customEvent: string, payload: any) {
    if (this.status !== ChannelStatus.JOINED) {
      throw new Error('Cant send command to inactive channel');
    }
    return this.socket.sendEvent(customEvent, payload, this.name);
  }

  join() {
    if (this.subscribed) return;
    this.subscribed = true;
    this.channelStatus = ChannelStatus.JOINING;
    this.socket.joinChannel(this.name);
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
    this.socket.leaveChannel(this.name);
  }
}
