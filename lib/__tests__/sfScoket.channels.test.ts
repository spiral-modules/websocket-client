/* eslint-disable no-new */
import WS from 'jest-websocket-mock';
import { SFSocket } from '../index';
import { socketOptions, makeTestSocketUrl } from '../mock-data';

const serverUrl = makeTestSocketUrl(socketOptions);
const clientMessage = {
  context: {
    channel: 'testChannel',
  },
  data: 'message',
  error: null,
  type: 'sfSocket:message',
};


describe('sfSocket channels', () => {
  beforeEach(() => {
    SFSocket.instances = [];
  });

  test('sfSocket channels should be connected', async () => {
    const ClientSocket = new SFSocket(socketOptions);
    const Server = new WS(serverUrl);
    const serverReceivedMessages = JSON.stringify({ cmd: 'join', args: ['testChannel'] });

    SFSocket.ready();
    ClientSocket.channel('testChannel');

    await Server.connected;

    await expect(Server).toReceiveMessage(serverReceivedMessages);
    expect(Server).toHaveReceivedMessages([serverReceivedMessages]);

    Server.close();
  });

  test('sfSocket connected callback should be called', async () => {
    const websocketCallback = jest.fn();
    const ClientSocket = new SFSocket(socketOptions);
    const Server = new WS(serverUrl);

    SFSocket.ready();

    const testChannel = ClientSocket.channel('testChannel');
    testChannel.subscribe('connected', websocketCallback);

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

    const SocketChannel = ClientSocket.channel('testChannel');
    SocketChannel.subscribe('message', channelCallback);


    expect(channelCallback).toHaveBeenCalledTimes(0);

    Server.send({ topic: 'testChannel', payload: 'message' });

    expect(channelCallback.mock.calls[0][0]).toEqual(clientMessage);
    expect(channelCallback).toHaveBeenCalledTimes(1);

    Server.close();
  });

  test('sfSocket channel close callback should be called', async () => {
    const channelCallback = jest.fn();

    const Server = new WS(serverUrl, { jsonProtocol: true });
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    const testChannel = ClientSocket.channel('testChannel');
    testChannel.subscribe('closed', channelCallback);

    await Server.connected;

    expect(channelCallback).toHaveBeenCalledTimes(0);

    Server.close();

    expect(channelCallback.mock.calls[0][0]).toBeUndefined();
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

    const testChannel = ClientSocket.channel('testChannel');
    testChannel.subscribe('error', channelCallback);

    await Server.connected;

    expect(consoleError).toHaveBeenCalledTimes(0);

    Server.error();

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(channelCallback).toHaveBeenCalledTimes(1);

    Server.close();
  });
});
