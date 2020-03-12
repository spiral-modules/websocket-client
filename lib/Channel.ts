import { UEventCallback } from './types';
import { SFSocket } from './SFSocket';
import ConnectionManager, { ConnectionManagerEventMap } from './connection/ConnectionManager';
import { NamesDict } from './eventdispatcher/events';
import { autobind } from './autobind';

export enum ChannelStatus {
  CLOSED = 'closed', // Connection command not yet sent or connection was interrupted or server closed channel
  JOINING = 'joining', // Socket sent join command, server has not responded with OK
  JOINED = 'joined', // Server returned OK for join command
  LEAVING = 'leaving', // Socket sent leave command
  ERROR = 'error', // Join command produced an error
}

export default class Channel {
  private readonly selfName: string;

  private channelStatus: ChannelStatus = ChannelStatus.CLOSED;

  private socket: SFSocket;

  private cMgr: ConnectionManager;

  /**
   * Flag to indicate if channel should be joined
   */
  private enabled: boolean;

  constructor(name: string, socket: SFSocket) {
    this.selfName = name;
    this.socket = socket;
    this.cMgr = socket.cMgr;
    this.enabled = false;
  }

  get status() {
    return this.channelStatus;
  }

  get name() {
    return this.selfName;
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
    this.startListening();
    if (this.cMgr.isConnected()) {
      this.sendJoinCommand();
    }
  }

  subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.cMgr.bind(eventName, callback, this.name);
  }

  unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.cMgr.unbind(eventName, callback, this.name);
  }

  leave() {
    if (this.enabled) {
      this.enabled = false;
      this.channelStatus = ChannelStatus.LEAVING;
      if (this.cMgr.isConnected()) {
        this.cMgr.sendLeave([this.name]);
      }
      this.stopListening();
    }
  }

  @autobind
  private onConnect() {
    if (this.enabled) { // if should join/re-join
      this.sendJoinCommand();
    }
  }

  @autobind
  private onDisconnect() {
    this.channelStatus = ChannelStatus.CLOSED; // Channel has been closed by external event
  }

  @autobind
  private onJoin(channels: string[]) {
    if (channels.indexOf(this.name) >= 0) {
      this.channelStatus = ChannelStatus.JOINED; // Channel has failed to join
    }
  }

  @autobind
  private onLeft(channels: string[]) {
    if (channels.indexOf(this.name) >= 0) {
      this.channelStatus = ChannelStatus.CLOSED; // Channel was left
    }
  }

  @autobind
  private onJoinFailed(channels: string[]) {
    if (channels.indexOf(this.name) >= 0) {
      this.channelStatus = ChannelStatus.ERROR; // Failed to join
    }
  }

  private sendJoinCommand() {
    if (this.channelStatus !== ChannelStatus.JOINING) {
      this.channelStatus = ChannelStatus.JOINING;
      this.cMgr.sendJoin([this.name]);
    }
  }

  private startListening() {
    this.cMgr.bind(NamesDict.DISCONNECTED, this.onDisconnect);
    this.cMgr.bind(NamesDict.CHANNEL_JOIN_FAILED, this.onJoinFailed);
    this.cMgr.bind(NamesDict.CHANNEL_JOINED, this.onJoin);
    this.cMgr.bind(NamesDict.CHANNEL_LEFT, this.onLeft);
    this.cMgr.bind(NamesDict.CONNECTED, this.onConnect);
  }

  private stopListening() {
    this.cMgr.unbind(NamesDict.DISCONNECTED, this.onDisconnect);
    this.cMgr.unbind(NamesDict.CHANNEL_JOIN_FAILED, this.onJoinFailed);
    this.cMgr.unbind(NamesDict.CHANNEL_JOINED, this.onJoin);
    this.cMgr.unbind(NamesDict.CHANNEL_LEFT, this.onLeft);
    this.cMgr.unbind(NamesDict.CONNECTED, this.onConnect);
  }
}
