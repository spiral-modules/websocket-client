# Spiral Framework WebSocket

JavaScript WebSockets client library with channel support.

## Installation

SFSocket available for installing with npm or yarn

```bash
    npm install @sf/websockets -D  
```

```bash
    yarn add @sf/websockets 
```

Next use it like so
```js
    import { SFSocket } from '@sf/websockets';
```


Or via bundle file

```html
    <script src="/build/socket.js"></script>
    <script type="text/javascript">
        var Socket = SFSocket.SFSocket;
        var connection = new Socket({ host: 'localhost'});
    </script>
```

## API

SFSocket proposes easy way to use WebSockets:

```js
import { SFSocket } from '@sf/websockets';

const socketOptions = { host: 'localhost' };

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

### SFSocket

<table class="responsive">
  <tbody>
    <tr>
      <th colspan=2>SFSocket</th>
    </tr>        
    <tr>
      <td colspan=2>
        <b>Properties</b>
      </td>
    </tr>    
    <tr>
      <td>
        <code>static instances</code>
      </td>
      <td>
      <code>SFSocket[]</code><br>
       Array of all existing sockets
      </td>
    </tr>   
    <tr>
      <td>
        <code>static isReady</code>
      </td>
      <td>
      <code>boolean</code><br>
      false before `ready()` is called. If is true any new SFSocket will connect upon creation.
      </td>
    </tr>
    <tr>
      <td colspan=2>
        <b>Methods</b>
      </td>
    </tr>
    <tr>
      <td>
        <code>static ready()</code>
      </td>
      <td>
        Marks sockets as ready and launches all connections.<br>
        Use if you need to make all sockets to connect automatically on creation
      </td>
    </tr>
    <tr>
      <td>
        <code>constructor(options: ISFSocketConfig)</code>
      </td>
      <td>
        Create websocket connection<br>
        <code>options: ISFSocketConfig</code> - connection options
      </td>
    </tr>
    <tr>
      <td>
        <code>joinChannel(channel, dontJoin)</code>
      </td>
      <td>
        Creates a named channel and joins it<br>
        <code>channel: string</code> name of channel to join. Should not be one of system ones `@join` `#join` `@leave` and `#leave`<br>
        <code>dontJoin: boolean</code> <b>default false</b> if true, channel is created, registered inside instance but not joined automatically. Call `join` method to join later.<br>
        <code>return value: Channel</code> returns channel object
      </td>
    </tr>
    <tr>
      <td>
        <code>getChannel(channel)</code>
      </td>
      <td>
        Gets a previously created named channel<br>
        <code>return value: Channel</code> returns channel object
      </td>
    </tr>
    <tr>
      <td>
        <code>leaveChannel(channel)</code>
      </td>
      <td>
        Removes a named channel and leaves it<br>
        <code>channel: string</code> name of channel to join. Should not be one of system ones `@join` `#join` `@leave` and `#leave`<br>
        <code>return value: Channel</code> returns channel object
      </td>
    </tr>
    <tr>
      <td>
        <code>subscibe(event, callback, channel)</code>
      </td>
      <td>
        Subscribes to specific event<br>
        <code>event: string</code> one of valid event codes. See table below for possible events and their payload<br>
        <code>callback: (payload) => void</code> callback to call. Type of payload depends on event type<br>
        <code>channel: string</code> (optional) Channel name to follow. If none, subscribes for all. Note that doesn't automatically join channel, just adds listener to existing one.
      </td>
    </tr>
    <tr>
      <td>
        <code>unsubscibe(event, callback, channel)</code>
      </td>
      <td>
        Unsubscribes from specific event<br>
        <code>event: string</code> one of valid event codes. See table below for possible events and their payload<br>
        <code>callback: (payload) => void</code> callback to call. Type of payload depends on event type<br>
        <code>channel: string</code> (optional) Channel name to unfollow. If none, unsubscribes from all channels.. Note that doesn't automatically remove channel, just removes listener from existing one.
      </td>
    </tr>
  </tbody>
</table>

### SFSocket constructor options

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
import { SFSocket } from '@sf/websockets';

const socketOptions = {
  host: 'some.domain.com',
  port: '80',
  path: 'foo',
  queryParams: { bar: '1' }
}

const ws = new SFSocket(socketOptions);

```


### SFSocket channels

<table class="responsive">
  <tbody>
    <tr>
      <th colspan=2>Channel</th>
    </tr>    
    <tr>
      <td colspan=2>
        <b>Properties</b>
      </td>
    </tr>
    <tr>
      <td>
        <code>status</code>
      </td>
      <td>
        <code>string</code>
        Channel status, can be `closed` `joining` `joined` `leaving` and `error`
      </td>
    </tr>
    <tr>
      <td>
        <code>name</code>
      </td>
      <td>
        <code>string</code>
        Channel name
      </td>
    </tr>
    <tr>
      <td colspan=2>
        <b>Methods</b>
      </td>
    </tr>
    <tr>
      <td>
        <code>constructor(name: string, socket: SFSocket)</code>
      </td>
      <td>
        Creates a channel based on specific SFSocket<br>
        <code>name: string</code> - channel name. Can't be `@join` `#join` or `@leave`
      </td>
    </tr>
    <tr>
      <td>
        <code>join()</code>
      </td>
      <td>
        Enables channel and sends join command once connection is working
      </td>
    </tr>
    <tr>
      <td>
        <code>leave()</code>
      </td>
      <td>
        Disables channel and sends leave command if connection is working
      </td>
    </tr>
    <tr>
      <td>
        <code>subscibe(event, callback)</code>
      </td>
      <td>
        Subscribes to specific event<br>
        <code>event: string</code> one of valid event codes. See table below for possible events and their payload<br>
        <code>callback: (payload) => void</code> callback to call. Type of payload depends on event type<br>
      </td>
    </tr>
    <tr>
      <td>
        <code>unsubscibe(event, callback)</code>
      </td>
      <td>
        Unsubscribes from specific event<br>
        <code>event: string</code> one of valid event codes. See table below for possible events and their payload<br>
        <code>callback: (payload) => void</code> callback to call. Type of payload depends on event type<br>
      </td>
    </tr>
    <tr>
      <td>
        <code>connect()</code>
      </td>
      <td>
        Starts connection. This method is automatically called after `SFSocket.ready()` for all existing and new instances
      </td>
    </tr>
    <tr>
      <td>
        <code>disconnect()</code>
      </td>
      <td>
        Drops connection
      </td>
    </tr>
  </tbody>
</table>

### Supported events

`SFSocket` and `Channel` make it possible to subscribe to `connected`, `message`, `closed` and `error` events

`SFSocket` additionally allows to subscribe to `channel_joined` `channel_join_failed` and `channel_left` events

<table class="responsive">
  <tbody>
    <tr>
      <th colspan=2>Events</th>
    </tr>
    <tr>
      <td>
        <code>message</code>
      </td>
      <td>
        <code>ISFSocketEvent</code><br>
        Generic event of message from specific channel or broadcasted
        Payload depends on channel server implementation
      </td>
    </tr>
    <tr>
      <td>
        <code>error</code>
      </td>
      <td>
        <code>ISFSocketEvent</code><br>
        Event of error happened in specific channel or broadcasted
        Payload would contain error details
      </td>
    </tr>
    <tr>
      <td>
        <code>closed</code>
      </td>
      <td>
        <code>ISFSocketEvent</code><br>
        Connection was closed due some error. Socket might automatically reconnect after that.
      </td>
    </tr>
    <tr>
      <td>
        <code>channel_joined</code>
      </td>
      <td>
        <code>string[]</code><br>
        Indicates server confirming joining specific channels
      </td>
    </tr>
    <tr>
      <td>
        <code>channel_left</code>
      </td>
      <td>
        <code>string[]</code><br>
        Indicates server confirming leaving specific channels
      </td>
    </tr>
    <tr>
      <td>
        <code>channel_join_failed</code>
      </td>
      <td>
        <code>string[]</code><br>
        Indicates server denies joining specific channels
      </td>
    </tr>
  </tbody>
</table>

### ISFSocketEvent structure

<table class="responsive">
  <tbody>
    <tr>
      <th colspan=2>ISFSocketEvent</th>
    </tr>    
    <tr>
      <td>
        <code>type</code>
      </td>
      <td>
        <code>string</code><br>
        `sfSocket:message` `sfSocket:closed` or `sfSocket:error` depending on event tracked. 
      </td>
    </tr>
    <tr>
      <td>
        <code>data</code>
      </td>
      <td>
        <code>any</code><br>
        Any serializable payload depending on implementation that refers to successful flow
      </td>
    </tr>
    <tr>
      <td>
        <code>error</code>
      </td>
      <td>
        <code>string</code><br>
        Error message
      </td>
    </tr>
    <tr>
      <td>
        <code>context</code>
      </td>
      <td>
        <code>object</code><br>
        Object with event context details
      </td>
    </tr>
    <tr>
      <td>
        <code>context.code</code>
      </td>
      <td>
        <code>number</code><br>
        Error code if relevant
      </td>
    </tr>
    <tr>
      <td>
        <code>context.channel</code>
      </td>
      <td>
        <code>string</code><br>
        Channel name if relevant
      </td>
    </tr>
  </tbody>
</table>

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



### Samples

Working with events

```js
const ws = new SFSocket(socketOptions);

ws.subscribe('connected', () => console.log('connected'));
ws.subscribe('error', (sfSocketEvent) => doSomething(sfSocketEvent));
ws.subscribe('message', (sfSocketEvent) => doSomething(sfSocketEvent));
ws.subscribe('closed', () => console.log('closed'));

const channel = ws.joinChannel('topic1');

channel.subscribe('connected', () => console.log('connected'));
channel.subscribe('error', (sfSocketEvent) => doSomething(sfSocketEvent));
channel.subscribe('message', (sfSocketEvent) => doSomething(sfSocketEvent));
channel.subscribe('closed', () => console.log('closed'));
```

Multiple channels creation

```js
import { SFSocket } from '@sf/websockets';

const socketOptions = { host: 'localhost' };

const ws = new SFSocket(socketOptions);

SFSocket.ready();

// create a channel and it is automatically connected to server
const channel1 = ws.joinChannel('channel_1');
const channel2 = ws.joinChannel('channel_2', true); // This one wont auto-join now

// subscribe the channel to server 
channel1.subscribe('message', (event) => doSomething(event));
channel2.subscribe('message', (event) => doSomething(event));

channel2.join(); // Start receiving messages for channel2 

// disconnect the channel from server 
channel1.leave();
channel2.leave();

// disconnect everything
ws.disconnect()
```

### Custom commands

Sending custom commands is supported via `sendCommand` method. `join` and `leave` commands can't be used as command name, payload can be any serializable data.

```js
const cmd = 'foo'; // Any string except 'join' or 'leave'
const data = ['bar']; // Serializable data
ws.sendCommand(cmd, data);
````

## Development

##### Prerequisites

* [nodejs](https://nodejs.org/en/) 10.16.3+
* [yarn](https://yarnpkg.com/lang/en/) 1.19.1+

##### Windows

On windows execute `git config core.autocrlf false` to disable automatic line ending conversion.