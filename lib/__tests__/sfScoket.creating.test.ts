import { SFSocket } from '../index';
import { socketOptions } from '../mock-data';


describe('sfSocket instances count', () => {
  beforeEach(() => {
    SFSocket.instances = [];
  });

  test('should be once instance', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const t1 = new SFSocket(socketOptions);
    expect(SFSocket.instances.length).toBe(1);
  });

  test('should be multiple instances', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let t1 = new SFSocket(socketOptions);
    t1 = new SFSocket(socketOptions);
    t1 = new SFSocket(socketOptions);

    expect(SFSocket.instances.length).toBe(3);
  });
});

describe('initialization sfSocket with options', () => {
  test('should be an error with nullable options', () => {
    const optionsError = new Error('sfSocket options should be an object');

    expect(() => new SFSocket(null as any)).toThrowError(optionsError);
  });

  test('should be an error without options', () => {
    const optionsError = new Error('sfSocket options should be an object');

    expect(() => new SFSocket()).toThrowError(optionsError);
  });

  test('should be not an errors', () => {
    const socket = new SFSocket(socketOptions);
    expect(socket).toBeDefined(); // TODO update test case
  });
});

describe('sfSocket connections', () => {
  test('sfSocket state should be changed to connecting', () => {
    const ws = new SFSocket(socketOptions);
    SFSocket.ready();

    expect(ws.connection.state).toBe('connecting');
  });

  test('sfSocket state should be changed to disconnected', () => {
    const ws = new SFSocket(socketOptions);
    SFSocket.ready();

    ws.disconnect();

    expect(ws.connection.state).toBe('disconnected');
  });

  test('sfSocket defaults callbacks should be created', () => {
    const ws = new SFSocket(socketOptions);
    SFSocket.ready();

    const connectionCallbacksKeys = [
      'sf:connected',
      'sf:message',
      'sf:connecting',
      'sf:disconnected',
      'sf:error',
    ];

    const wsConnectionCallbacks = ws.connection.callbacks.callbacks;

    expect(wsConnectionCallbacks).not.toBeUndefined();

    connectionCallbacksKeys.forEach((key) => {
      expect(wsConnectionCallbacks[key]).not.toBeUndefined();
    });
  });
});
