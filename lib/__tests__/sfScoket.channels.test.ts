/* eslint-disable no-new */
import WS from 'jest-websocket-mock';
import { ChannelStatus } from '../Channel';
import { NamesDict } from '../eventdispatcher/events';
import { SFSocket } from '../index';
import { makeTestSocketUrl, socketOptions } from '../mock-data';
import { SFSocketEventType } from '../SFSocket';

const serverUrl = makeTestSocketUrl(socketOptions);
const clientMessage = {
  context: {
    channel: 'testChannel',
  },
  data: 'message',
  error: null,
  type: SFSocketEventType.MESSAGE,
};

describe('sfSocket channels', () => {
  beforeEach(() => {
    SFSocket.instances = [];
  });

  test('sfSocket channels should be connected', async () => {
    const ClientSocket = new SFSocket(socketOptions);
    const Server = new WS(serverUrl);
    const serverReceivedMessages = JSON.stringify({ command: 'join', topics: ['testChannel'] });

    SFSocket.ready();
    const channel = ClientSocket.joinChannel('testChannel');

    await Server.connected;
    expect(channel.status).toBe(ChannelStatus.JOINING);
    await expect(Server).toReceiveMessage(serverReceivedMessages);
    Server.send(JSON.stringify({ topic: '@join', payload: ['testChannel'] }));

    // expect(channel.status).toBe(ChannelStatus.JOINED);

    expect(Server).toHaveReceivedMessages([serverReceivedMessages]);

    Server.close();
  });

  test('sfSocket connected callback should be called', async () => {
    const websocketCallback = jest.fn();
    const ClientSocket = new SFSocket(socketOptions);
    const Server = new WS(serverUrl);

    SFSocket.ready();

    const testChannel = ClientSocket.joinChannel('testChannel');
    testChannel.subscribe(NamesDict.CONNECTED, websocketCallback);

    expect(websocketCallback).toHaveBeenCalledTimes(0);

    await Server.connected;

    expect(websocketCallback.mock.calls[0][0]).toBeUndefined();
    expect(websocketCallback).toHaveBeenCalledTimes(1);

    Server.close();
  });

  test('sfSocket channel message callback should be called', async () => {
    const channelCallback = jest.fn();

    const Server = new WS(serverUrl, { jsonProtocol: true });
    const ClientSocket = new SFSocket(socketOptions);

    SFSocket.ready();

    await Server.connected;

    const SocketChannel = ClientSocket.joinChannel('testChannel');
    SocketChannel.subscribe(NamesDict.MESSAGE, channelCallback);

    expect(channelCallback).toHaveBeenCalledTimes(0);

    Server.send({ topic: 'testChannel', payload: 'message' });

    expect(channelCallback).toHaveBeenCalledTimes(1);
    expect(channelCallback.mock.calls[0][0]).toEqual(clientMessage);

    Server.close();
  });

  test('sfSocket channel close callback should be called', async () => {
    const channelCallback = jest.fn();

    const Server = new WS(serverUrl, { jsonProtocol: true });
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    const testChannel = ClientSocket.joinChannel('testChannel');
    testChannel.subscribe(NamesDict.CLOSED, channelCallback);

    await Server.connected;

    expect(channelCallback).toHaveBeenCalledTimes(0);

    Server.close();

    expect(channelCallback.mock.calls[0][0]).toEqual({
      context: { code: undefined }, data: null, error: undefined, type: SFSocketEventType.ERROR,
    });
    expect(channelCallback).toHaveBeenCalledTimes(1);
  });

  test('sfSocket channel error callback should be called', async () => {
    const consoleError = jest.fn();
    // eslint-disable-next-line no-console
    console.error = consoleError;
    const channelCallback = jest.fn();

    const Server = new WS(serverUrl, { jsonProtocol: true });
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    const testChannel = ClientSocket.joinChannel('testChannel');
    testChannel.subscribe(NamesDict.ERROR, channelCallback);

    await Server.connected;

    expect(consoleError).toHaveBeenCalledTimes(0);

    Server.error();

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(channelCallback).toHaveBeenCalledTimes(1);

    Server.close();
  });
});
