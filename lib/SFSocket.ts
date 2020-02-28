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
  CONNECTING='sfSocket:connecting',
  MESSAGE='sfSocket:message',
  ERROR='sfSocket:error',
  CLOSED='sfSocket:closed',
}


export interface ISFSocketConfig {
  host: string,
  port: string | number;
  portTLS?: string | number;
  path: string;
  unavailableTimeout?: number;
  useTLS?: boolean;
  useStorage?: boolean;
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

export interface SFSocketEventMap {
  [NamesDict.MESSAGE]: ISFSocketEvent
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

  config: ISFSocketConfig;

  channels: IChannels = {};

  cMgr: ConnectionManager;

  hasStorage: boolean;

  constructor(options?: ISFSocketConfig) {
    if (!options || typeof options !== 'object') {
      throw new Error('sfSocket options should be an object');
    }

    const constructorOptions = options || {};

    this.config = {
      ...defaultConfig,
      ...constructorOptions,
    };

    this.hasStorage = Boolean(this.config.useStorage && window && window.localStorage);

    this.cMgr = new ConnectionManager(this.config);

    this.cMgr.bind(NamesDict.CONNECTED, () => {
      Object.values(this.channels).forEach((channel) => {
        channel.join(); // Send join command again on connect
      });
    });

    this.cMgr.bind(NamesDict.CONNECTING, () => {
      this.channelsDisconnect();
    });

    this.cMgr.bind(NamesDict.DISCONNECTED, () => {
      this.channelsDisconnect();
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

  // TODO: what was that TODO about? Test if works and remove
  subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string) {
    return this.cMgr.bind(eventName, callback, channel);
  }

  // TODO: what was that TODO about? Test if works and remove
  unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>, channel?: string) {
    return this.cMgr.unbind(eventName, callback, channel);
  }

  // TODO: Why we want to add channel from other socket to instance
  /**
   * @deprecated
   */
  addChannel(name : string, socket : SFSocket) {
    if (!this.channels[name]) {
      this.channels[name] = new Channel(name, socket);
    }
    return this.channels[name];
  }

  joinChannel(chanelName: string) {
    if (this.channels[chanelName]) {
      throw new Error(`Channel ${chanelName} already exists`);
    }
    this.channels[chanelName] = new Channel(chanelName, this);
    if (this.cMgr.isConnected()) {
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

  private channelsDisconnect() {
    Object.values(this.channels).forEach((channel: Channel) => channel.disconnect());
  }
}
