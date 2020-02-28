# Spiral Framework WebSocket

JavaScript WebSockets client library supports channels.


## Installs

SFSocket available for installing with npm
```bash
    TODO:    
```

or CDN

```html
    <script src="TODO:"></script>
```

## WebSocket

SFSocket proposes easy way to use WebSockets:

```js
// create an instance of SFSocket
const ws = new SFSocket(socketOptions);

const prepareEvent = event => doSomething(event);

// subscribe to server
ws.subscribe('message', prepareEvent);

// runtime ready for all instances
SFSocket.ready();

// unsubscribe from server 
ws.unsubscribe('message', prepareEvent);

// disconnect from server 
ws.disconnect();
```


### Channels

Multiple channels available in SFSocket

```js
const ws = new SFSocket(socketOptions);

SFSocket.ready()

// create a channel and it is automatically connected to server
const channel1 = ws.channel('channel_1');
const channel2 = ws.channel('channel_2');

// subscribe the channel to server 
channel1.subscribe('message', (event) => doSomething(event));
channel2.subscribe('message', (event) => doSomething(event));

// disconnect the channel from server 
channel1.disconnect()
channel2.disconnect()
//or
ws.disconnect()
```



### Constructor options

SFSocket supports standard (ws) and secure (wss) protocols

```js
const socketOptions = {
  host, // string, required
  port, // string | number, default: 80
  portTLS, // string | number, optional, default: 443
  path, // string, required, default: ''
  unavailableTimeout, // number, optional, default: 10000
  useTLS, // boolean, optional, default: false
  useStorage, // boolean, optional, default: false
}

```

### Supported events

SFSocket makes it possible to subscribe to `connected`, `message`, `closed` and `error` events

```js
ws.subscribe('connected', () => console.log('connected'));
ws.subscribe('error', (sfSocketEvent) => doSomething(sfSocketEvent));
ws.subscribe('message', (sfSocketEvent) => doSomething(sfSocketEvent));
ws.subscribe('closed', () => console.log('closed'));
```

### Supported format

SFSocket works in a particular format:

```js
// Send join or leave command manually
const cmd = 'join'; // 'join' or 'leave'
const data = ['command arguments']; // List of channels
ws.sendCommand(cmd, data);
````

````js
// Send custom command
const cmd = 'custom';
const data = ['command arguments']; // any data
const channel = 'channel_1'; // Optional param to select channel to send
ws.sendCommand(cmd, data, channel);
````

### Events

SFSocket events' formats:

##### Message Event

```typescript
const MessageEvent: ISFSocketEvent = {
  context: {
    channel: 'channel', // optional
    code: 1001, // optional
  },
  data: 'message',
  error: null,
  type: 'sfSocket:message',
};
```

##### Error Event

```typescript
const ErrorEvent: ISFSocketEvent = {
  context: {
    channel: 'channel', // optional
    code: 1006, // optional
  },
  data: null,
  error: 'message',
  type: 'sfSocket:error',
};
```

`closed` and `connected` subscriptions do not have any event.

Development
-----------

##### Prerequisites

* [nodejs](https://nodejs.org/en/) 10.16.3+
* [yarn](https://yarnpkg.com/lang/en/) 1.19.1+

##### Windows

On windows execute `git config core.autocrlf false` to disable automatic line ending conversion.

##### TODO

* What kind of commands we are expected to send on server. Currently only 'join' and 'leave' are sending something legit. Channel name in 'sendCommand' is completely ignored.
* We don't need separate 'sfSocket' prefix as all binds are already having a type and we can either omit it or remove completely
* Connection callback can and should be made into promise. Or why do we might need flow of error events? Needs research.
* Needs documenting that channel names should not have '@' symbol and why