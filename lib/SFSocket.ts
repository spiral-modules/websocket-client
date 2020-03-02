import { UEventCallback } from './types';
import Channel from './Channel';
import ConnectionManager, { ConnectionManagerEventMap } from './connection/ConnectionManager';
import { defaultConfig } from './constants';
import { NamesDict } from './eventdispatcher/events';

export interface IChannels {
  [name: string]: Channel;
}

// TODO: why do we even need 'sfSocket' prefix and not just reuse type
export enum SFSocketEventType {
  CONNECTING = 'sfSocket:connecting',
  MESSAGE = 'sfSocket:message',
  CHANNEL_JOINED = 'channel_joined',
  CHANNEL_JOIN_FAILED = 'channel_join_failed',
  CHANNEL_LEFT = 'channel_left',
  CHANNEL_LEAVE_FAILED = 'channel_leave_failed',
  ERROR = 'sfSocket:error',
  CLOSED = 'sfSocket:closed',
}


export interface ISFSocketConfig {
  host: string,
  port: string | number;
  path: string;
  queryParams?: { [key: string]: string };
  unavailableTimeout?: number;
  useTLS?: boolean;
}

export interface ISFSocketEvent {
  type: SFSocketEventType,
  data: string | null,
  error: string | null,
  context?: {
    channel?: string,
    code?: string | number,
  } | null
}

export class SFSocket {
  static instances: SFSocket[] = [];

  static isReady: boolean = false;

  static ready() {
    SFSocket.isReady = true;

    SFSocket.instances.forEach((instance) => {
      instance.connect();
    });
  }

  private config: ISFSocketConfig;

  channels: IChannels = {};

  cMgr: ConnectionManager;

  constructor(options?: ISFSocketConfig) {
    if (!options || typeof options !== 'object') {
      throw new Error('sfSocket options should be an object');
    }

    const constructorOptions = options || {};

    this.config = {
      ...defaultConfig,
      port: constructorOptions.useTLS ? 443 : 80,
      ...constructorOptions,
    };

    this.cMgr = new ConnectionManager(this.config);

    this.cMgr.bind(NamesDict.CONNECTED, () => {
      Object.values(this.channels).forEach((channel) => {
        channel.join(); // Send join command again on connect
      });
    });

    this.cMgr.bind(NamesDict.ERROR, (err: ISFSocketEvent) => {
      console.error(err); // eslint-disable-line no-console
    });

    SFSocket.instances.push(this);

    if (SFSocket.isReady) {
      this.connect();
    }
  }

  connect() {
    this.cMgr.connect();
  }

  disconnect() {
    this.cMgr.disconnect();
  }

  /**
   * Send custom command to server
   * @param cmdName - string name of command
   * @param data - serializable payload for data
   */
  sendCommand(cmdName: string, data: any) {
    return this.cMgr.sendCommand(cmdName, data);
  }

  joinChannelList(channelsNames: string[]) {
    channelsNames.forEach((channelsName) => {
      this.joinChannel(channelsName);
    });
  }

  leaveChannelList(channelNames: string[]) {
    channelNames.forEach((channelName) => {
      this.leaveChannel(channelName);
    });
  }

  /**
   * Subscribe to event globally
   * @param eventName
   * @param callback
   * @param channel - optional channel to monitor. Note subscribing to channel here is not creating auto-rejoinable channel.
   * Join channel explicitly to make it auto-rejoinable
   */
  subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string) {
    return this.cMgr.bind(eventName, callback, channel);
  }

  /**
   * Unsubscribe from event globally
   * @param eventName
   * @param callback
   * @param channel - optional channel to monitor. Note subscribing to channel here is not creating auto-rejoinable channel.
   * Join channel explicitly to make it auto-rejoinable
   */
  unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string) {
    return this.cMgr.unbind(eventName, callback, channel);
  }

  joinChannel(chanelName: string) {
    if (this.channels[chanelName]) {
      throw new Error(`Channel ${chanelName} already exists`);
    }
    this.channels[chanelName] = new Channel(chanelName, this);
    if (this.cMgr.isConnected()) { // Else it will auto-happen on CONNECTED
      this.channels[chanelName].join();
    }
    return this.channels[chanelName];
  }

  leaveChannel(chanelName: string) {
    if (!this.channels[chanelName]) {
      throw new Error(`Channel ${chanelName} does not exist`);
    }
    const channel = this.channels[chanelName];
    channel.leave();
    delete this.channels[chanelName];
    return channel;
  }

  getChannel(name: string): Channel {
    return this.channels[name];
  }
}
