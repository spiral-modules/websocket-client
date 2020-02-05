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
// SFSocket sends
ws.sendEvent({ cmd: 'join', args: ['command arguments']}) // `args` field may contain names of channels

// SFSocket is expected
ServerSocket.send(JSON.stringify({ topic: 'message', payload: 'any structure' })) // `topic` field may contain channel names
````

### Events

SFSocket events' formats:

##### Message Event

```js
const MessageEvent = {
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

```js
const ErrorEvent = {
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
