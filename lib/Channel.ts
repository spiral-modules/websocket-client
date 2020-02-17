import { UEventCallback } from './types';
import { SFSocket } from './SFSocket';
import { ConnectionManagerEventMap } from './connection/ConnectionManager';

export default class Channel {
  name: string;

  socket: SFSocket;

  subscribed: boolean;

  subscriptionCancelled: boolean;

  constructor(name: string, socket: SFSocket) {
    this.name = name;
    this.socket = socket;
    this.subscribed = false;
    this.subscriptionCancelled = false;
  }

  trigger(event: string, data: string[]) { // TODO
    if (!this.subscribed) {
      console.warn('Client event triggered before channel \'subscription_succeeded\' event'); // eslint-disable-line no-console
    }
    return this.socket.sendEvent(event, data, this.name);
  }

  disconnect() {
    this.subscribed = false;
  }

  join() {
    if (this.subscribed) return;
    this.subscriptionCancelled = false;
    this.subscribed = true;
    this.socket.joinChannel(this.name);
  }

  subscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.socket.subscribe(eventName, callback, this.name);
  }

  unsubscribe<K extends keyof ConnectionManagerEventMap>(eventName: K, callback: UEventCallback<ConnectionManagerEventMap, K>) {
    this.socket.unsubscribe(eventName, callback, this.name);
  }

  leaveChannel() {
    this.subscribed = false;
    this.socket.leaveChannel(this.name);
  }

  cancelSubscription() {
    this.subscriptionCancelled = true;
  }

  reinstateSubscription() {
    this.subscriptionCancelled = false;
  }
}
