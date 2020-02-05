/* eslint-disable no-new */
/* eslint-disable no-undef */

import { SFSocket } from '../lib/index';
import { socketOptions } from './resources';


describe('sfSocket instances count', () => {
  beforeEach(() => {
    SFSocket.instances = [];
  });

  test('should be once instance', () => {
    new SFSocket(socketOptions);
    expect(SFSocket.instances.length).toBe(1);
  });

  test('should be multiple instances', () => {
    new SFSocket(socketOptions);
    new SFSocket(socketOptions);
    new SFSocket(socketOptions);

    expect(SFSocket.instances.length).toBe(3);
  });
});

describe('initialization sfSocket with options', () => {
  test('should be an error with nullable options', () => {
    const optionsError = new Error('sfSocket options should be an object');

    expect(() => new SFSocket(null)).toThrowError(optionsError);
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
