import WS from 'jest-websocket-mock';
import { SFSocket } from '../index';
import { socketOptions, makeTestSocketUrl } from '../mock-data';
import { NamesDict } from '../eventdispatcher/events';

const fakeUrl = makeTestSocketUrl(socketOptions);

describe('sfSocket connections', () => {
  beforeEach(() => {
    SFSocket.instances = [];
  });

  test('sfSocket state should be connecting', () => {
    const ClientSocket = new SFSocket(socketOptions);

    SFSocket.ready();
    expect(ClientSocket.cMgr.state).toBe(NamesDict.CONNECTING);
  });

  test('sfSocket can receive message with error', async () => {
    const consoleError = jest.fn();
    // eslint-disable-next-line no-console
    console.error = consoleError;
    const ServerMessage = { type: 'GREETING', payload: 'hello' };

    const Server = new WS(makeTestSocketUrl(socketOptions));
    const ClientSocket = new SFSocket(socketOptions);
    SFSocket.ready();

    await Server.connected;

    Server.send(ServerMessage);

    expect(consoleError).toBeCalled();
    expect(ClientSocket).toBeTruthy();

    Server.close();
  });

  test('sfSocket can receive message without error', async () => {
    const consoleError = jest.fn();
    // eslint-disable-next-line no-console
    console.error = consoleError;
    const ServerMessage = JSON.stringify({ type: 'GREETING', payload: 'hello' });

    const ClientSocket = new SFSocket(socketOptions);
    const Server = new WS(fakeUrl);

    SFSocket.ready();

    await Server.connected;

    Server.send(ServerMessage);

    expect(ClientSocket).toBeTruthy();
    expect(consoleError).not.toBeCalled();
    Server.close();
  });
});

describe('sfSocket events', () => {
  beforeEach(() => {
    SFSocket.instances = [];
  });

  test('sfSocket should successfully send event', async () => {
    const ClientSocket = new SFSocket(socketOptions);
    const Server = new WS(fakeUrl);
    const clientMessage = JSON.stringify({ topic: 'test', payload: ['data'] });

    SFSocket.ready();

    await Server.connected;

    ClientSocket.sendCommand('test', ['data']);

    expect(Server).toReceiveMessage(clientMessage);

    Server.close();
  });

  test('sfSocket should push join event', async () => {
    const Server = new WS(fakeUrl);
    const ClientSocket = new SFSocket(socketOptions);
    const joinData = ['joinData'];
    const clientMessage = JSON.stringify({ command: 'join', payload: joinData });

    SFSocket.ready();

    await Server.connected;

    ClientSocket.joinChannel('joinData');

    await expect(Server).toReceiveMessage(clientMessage);

    Server.close();
  });

  test('sfSocket should push leave event', async () => {
    const Server = new WS(fakeUrl);
    const ClientSocket = new SFSocket(socketOptions);
    const joinData = ['joinData'];
    const clientMessage1 = JSON.stringify({ command: 'join', topics: joinData });
    const clientMessage2 = JSON.stringify({ command: 'leave', topics: joinData });

    SFSocket.ready();

    await Server.connected;

    ClientSocket.joinChannel('joinData');
    ClientSocket.leaveChannel('joinData');

    await expect(Server).toReceiveMessage(clientMessage1);
    await expect(Server).toReceiveMessage(clientMessage2);

    Server.close();
  });
});
