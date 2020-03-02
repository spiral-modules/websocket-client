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

SFSocket supports standard (ws) and secure (wss) protocols.

SFSocket constructor `new SFSocket(options: ISFSocketConfig)` is expecting options of type `ISFSocketConfig`

<table class="responsive">
  <tbody>
    <tr>
      <th colspan=2>ISFSocketConfig</th>
    </tr>
    <tr>
      <td>
        <code>host</code>
      </td>
      <td>
        <code>string</code><br>
        Host websocket should connect to
      </td>
    </tr>
    <tr>
      <td>
        <code>port</code>
      </td>
      <td>
        <code>string</code> or <code>number</code><br>
        (optional) Port websocket should connect to<br>
        <b>Default</b>: 80 or 443 if useTSL = true
      </td>
    </tr>
    <tr>
      <td>
        <code>useTSL</code>
      </td>
      <td>
        <code>boolean</code><br>
        (optional) Use TSL `wss` instead of regular `ws` protocol<br>
        <b>Default</b>: false
      </td>
    </tr>
    <tr>
      <td>
        <code>path</code>
      </td>
      <td>
        <code>string</code><br>
        (optional) Server path part<br>
        <b>Default</b>: empty
      </td>
    </tr>
    <tr>
      <td>
        <code>queryParams</code>
      </td>
      <td>
        <code>object</code> of <code>{[key: string]: string}</code> type<br>
        (optional) Query params map to append to path<br>
        <b>Default</b>: empty
      </td>
    </tr>
    <tr>
      <td>
        <code>unavailableTimeout</code>
      </td>
      <td>
        <code>number</code><br>
        (optional) A timeout which is considered to be large enough to stop retrying reconnects if server response takes longer<br>
        <b>Default</b>: 10000
      </td>
    </tr>
  </tbody>
</table>


For example to establish connection to `ws://some.domain.com/foo?bar=1` use following code 

```js
import { SFSocket } from '@sf/webcokets';

const socketOptions = {
  host: 'some.domain.com',
  port: '80',
  path: 'foo',
  queryParams: { bar: '1' }
}

const ws = new SFSocket(socketOptions);

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