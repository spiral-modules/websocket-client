import { UEventCallback } from './types';
import { SFSocket } from './SFSocket';
import ConnectionManager, { ConnectionManagerEventMap } from './connection/ConnectionManager';
import { NamesDict } from './eventdispatcher/events';

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

  /**
   * Flag to indicate if channel should be joined
   */
  enabled: boolean;

  constructor(name: string, socket: SFSocket) {
    this.name = name;
    this.socket = socket;
    this.cMgr = socket.cMgr;
    this.enabled = false;
    this.cMgr.bind(NamesDict.DISCONNECTED, () => {
      this.channelStatus = ChannelStatus.CLOSED; // Channel has been closed by external event
    });
    this.cMgr.bind(NamesDict.CHANNEL_JOIN_FAILED, (channels: string[]) => {
      if (channels.indexOf(this.name) >= 0) {
        this.channelStatus = ChannelStatus.CLOSED; // Channel has failed to join
      }
    });
    this.cMgr.bind(NamesDict.CHANNEL_JOINED, (channels: string[]) => {
      if (channels.indexOf(this.name) >= 0) {
        this.channelStatus = ChannelStatus.JOINED; // Channel has failed to join
      }
    });
    this.cMgr.bind(NamesDict.CHANNEL_LEFT, (channels: string[]) => {
      if (channels.indexOf(this.name) >= 0) {
        this.channelStatus = ChannelStatus.CLOSED; // Channel has failed to join
      }
    });
    this.cMgr.bind(NamesDict.CONNECTED, () => {
      if (this.enabled) { // if should join/re-join
        this.sendJoinCommand();
      }
    });
  }

  get status() {
    return this.channelStatus;
  }

  /**
   * Channel is active and working rn
   */
  get isActive() {
    return this.cMgr.isConnected() && this.channelStatus === ChannelStatus.JOINED;
  }

  join() {
    if (this.enabled) return;
    this.enabled = true;
    if (this.cMgr.isConnected()) {
      this.sendJoinCommand();
    }
  }

  private sendJoinCommand() {
    if (this.channelStatus !== ChannelStatus.JOINING) {
      this.channelStatus = ChannelStatus.JOINING;
      this.cMgr.sendJoin([this.name]);
    }
  }

  subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.cMgr.bind(eventName, callback, this.name);
  }

  unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.cMgr.unbind(eventName, callback, this.name);
  }

  leave() {
    if (this.channelStatus !== ChannelStatus.LEAVING) {
      this.enabled = false;
      this.channelStatus = ChannelStatus.LEAVING;
      this.cMgr.sendLeave([this.name]);
      this.channelStatus = ChannelStatus.CLOSED;
    }
  }
}
