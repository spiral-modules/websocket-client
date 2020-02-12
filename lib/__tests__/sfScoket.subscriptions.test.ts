/* eslint-disable no-new */
import WS from 'jest-websocket-mock';
import { SFSocket } from '../index';
import { socketOptions, makeTestSocketUrl } from '../mock-data';

const serverMessage = JSON.stringify({ topic: 'message', payload: 'test' });
const clientMessage = {
  context: {
    channel: 'message',
  },
  data: 'test',
  error: null,
  type: 'sfSocket:message',
};


const serverUrl = makeTestSocketUrl(socketOptions);


describe('sfSocket subscriptions', () => {
  beforeEach(() => {
    SFSocket.instances = [];
  });

  test('sfSocket connected callback should be called', async () => {
    const websocketCallback = jest.fn();
    const ClientSocket = new SFSocket(socketOptions);
    const Server = new WS(serverUrl);

    SFSocket.ready();

    ClientSocket.subscribe('connected', websocketCallback);

    await Server.connected;

    expect(websocketCallback.mock.calls[0][0]).toBeUndefined();
    expect(websocketCallback).toHaveBeenCalledTimes(1);

    Server.close();
  });

  test('sfSocket message callback should be called', async () => {
    const websocketCallback = jest.fn();
    const Server = new WS(serverUrl);
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    ClientSocket.subscribe('message', websocketCallback);

    await Server.connected;

    Server.send(serverMessage);

    expect(websocketCallback.mock.calls[0][0]).toEqual(clientMessage);
    expect(websocketCallback).toHaveBeenCalledTimes(1);

    Server.close();
  });

  test('sfSocket message callback should be called multiple times', async () => {
    const websocketCallback = jest.fn();

    const Server = new WS(serverUrl);
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    ClientSocket.subscribe('message', websocketCallback);

    await Server.connected;

    Server.send(serverMessage);
    Server.send(serverMessage);
    Server.send(serverMessage);

    expect(websocketCallback.mock.calls[0][0]).toEqual(clientMessage);
    expect(websocketCallback.mock.calls[1][0]).toEqual(clientMessage);
    expect(websocketCallback.mock.calls[2][0]).toEqual(clientMessage);
    expect(websocketCallback).toHaveBeenCalledTimes(3);

    Server.close();
  });

  test('sfSocket error callback should be called', async () => {
    const websocketCallback = jest.fn();
    const consoleError = console.error = jest.fn();

    const Server = new WS(serverUrl);
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    ClientSocket.subscribe('error', websocketCallback);

    await Server.connected;

    expect(consoleError).toHaveBeenCalledTimes(0);

    Server.error();

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(websocketCallback).toHaveBeenCalledTimes(1);

    Server.close();
  });


  test('sfSocket close callback should be called', async () => {
    const socketCallback = jest.fn();

    const Server = new WS(serverUrl, { jsonProtocol: true });
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    ClientSocket.subscribe('closed', socketCallback);

    await Server.connected;

    expect(socketCallback).toHaveBeenCalledTimes(0);

    Server.close();

    expect(socketCallback.mock.calls[0][0]).toBeUndefined();
    expect(socketCallback).toHaveBeenCalledTimes(1);
  });
});
