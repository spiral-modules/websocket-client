import { UndescribedCallbackFunction } from './types';
import Channel from './Channel';
import ConnectionManager, { ConnectionState } from './connection/ConnectionManager';
import { defaultConfig, STORAGE_KEY } from './constants';
import { EventType } from './events';
import EventsDispatcher from './EventsDispatcher';

const CONNECTION_EVENTS = {
  JOIN: 'join',
  LEAVE: 'leave',
};

export interface IChannels {
  [name: string]: Channel;
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
  type: string,
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

  config: ISFSocketConfig;

  channels: IChannels;

  eventsDispatcher: EventsDispatcher;

  connection: ConnectionManager;

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

    this.channels = {};
    this.eventsDispatcher = new EventsDispatcher();

    this.hasStorage = Boolean(this.config.useStorage && window && window.localStorage);

    this.connection = new ConnectionManager(this.config);

    this.connection.bind(EventType.CONNECTED, () => {
      Object.keys(this.channels).forEach((channelName) => {
        this.subscribeChannel(channelName);
      });
    });

    this.connection.bind(EventType.MESSAGE, (event: any) => {
      this.eventsDispatcher.emit(EventType.MESSAGE, event);
    });

    this.connection.bind(EventType.CONNECTING, () => {
      this.channelsDisconnect();
    });

    this.connection.bind(EventType.DISCONNECTED, () => {
      this.channelsDisconnect();
    });

    this.connection.bind(EventType.ERROR, (err: Error) => {
      console.error(err); // eslint-disable-line no-console
    });

    SFSocket.instances.push(this);

    if (SFSocket.isReady) {
      this.connect();
    }

    if (this.hasStorage) {
      const activeChannels: string[] = this.getStorage();

      if (activeChannels) {
        activeChannels.forEach((channelName) => {
          this.subscribeChannel(channelName);
        });
      }
    }
  }

  connect() {
    this.connection.connect();
  }

  disconnect() {
    this.connection.disconnect();
  }

  // connections
  sendEvent(eventName: string, data: string[], channel?: string) {
    return this.connection.sendEvent(eventName, data, channel);
  }

  join(data: string[]) {
    return this.sendEvent(CONNECTION_EVENTS.JOIN, data);
  }

  leave(data: string[]) {
    return this.sendEvent(CONNECTION_EVENTS.LEAVE, data);
  }

  listen(channelsNames: string[]) {
    channelsNames.forEach((channelsName) => {
      if (this.connection.state === ConnectionState.CONNECTED) {
        this.joinChannel(channelsName);
      } else {
        this.subscribeChannel(channelsName);
      }
    });
  }

  stopListen(channelNames: string[]) {
    channelNames.forEach((channelName) => {
      const removedChannel = this.removeChannel(channelName);
      if (removedChannel && this.connection.state === ConnectionState.CONNECTED) {
        removedChannel.leaveChannel();
      }
    });
  }

  subscribe(eventName: EventType, callback: UndescribedCallbackFunction, channel?: string) { // TODO
    return this.connection.bind(eventName, callback, channel);
  }

  unsubscribe(eventName: EventType, callback: UndescribedCallbackFunction, channel?: string) { // TODO
    return this.connection.unbind(eventName, callback, channel);
  }

  // channels
  channel(channelName: string): Channel {
    return this.subscribeChannel(channelName);
  }

  addChannel(name : string, socket : SFSocket) {
    if (!this.channels[name]) {
      this.channels[name] = new Channel(name, socket);
    }
    return this.channels[name];
  }

  joinChannel(chanelName: string) {
    this.addStorageChannel(chanelName);
    return this.sendEvent(CONNECTION_EVENTS.JOIN, [chanelName]);
  }

  leaveChannel(chanelName: string) {
    this.removeStorageChannel(chanelName);
    return this.sendEvent(CONNECTION_EVENTS.LEAVE, [chanelName]);
  }

  findChannel(name: string): Channel {
    return this.channels[name];
  }

  private removeChannel(name : string) {
    const channel = this.channels[name];
    delete this.channels[name];
    return channel;
  }

  private channelsDisconnect() {
    Object.values(this.channels).forEach((channel: Channel) => channel.disconnect());
  }

  private subscribeChannel(channelName: string) {
    const channel = this.addChannel(channelName, this);

    if (channel.subscriptionCancelled) {
      channel.reinstateSubscription();
    } else if (this.connection.state === ConnectionState.CONNECTED) {
      channel.join();
    }
    return channel;
  }

  // storage
  getStorage() {
    if (this.hasStorage) {
      const storageData = window.localStorage.getItem(STORAGE_KEY);

      return storageData ? JSON.parse(storageData) : null;
    }

    return null;
  }

  addStorageChannel(channelName: string) {
    if (this.hasStorage) {
      const activeStorageChannels = this.getStorage();

      if (activeStorageChannels) { // remove older records
        const activeChannels = activeStorageChannels.filter((channel: string) => channel !== channelName); // eslint-disable-line max-len

        activeChannels.push(channelName);

        this.setStorage(activeChannels);
      } else {
        this.setStorage([channelName]);
      }
    }
  }

  removeStorageChannel(channelName: string) {
    if (this.hasStorage) {
      const activeStorage = this.getStorage();

      if (activeStorage) {
        const currentData = activeStorage.filter((channel: string) => channel !== channelName);

        if (currentData.length) {
          this.setStorage(currentData);
        } else {
          this.clearStorage();
        }
      }
    }
  }

  setStorage(args: string[]) {
    if (this.hasStorage) {
      return window.localStorage.setItem(STORAGE_KEY, JSON.stringify(args));
    }

    return null;
  }

  clearStorage() {
    if (this.hasStorage) {
      return window.localStorage.removeItem(STORAGE_KEY);
    }

    return null;
  }
}
