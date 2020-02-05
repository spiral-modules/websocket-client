import EventsDispatcher from './eventsDispatcher';
import { SFSocket } from './sfSocket';

export default class Channel extends EventsDispatcher {
  name: string;

  socket: SFSocket;

  subscribed: boolean;

  subscriptionCancelled: boolean;

  constructor(name : string, socket: SFSocket) {
    super();

    this.name = name;
    this.socket = socket;
    this.subscribed = false;
    this.subscriptionCancelled = false;
  }

  trigger(event : string, data : any) { // TODO
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

  subscribe(eventName: string, data: any) { // TODO
    this.socket.subscribe(eventName, data, this.name);
  }

  unsubscribe(eventName: string, data: any) { // TODO
    this.socket.unsubscribe(eventName, data, this.name);
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
