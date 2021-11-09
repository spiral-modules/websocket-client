import { ISFSocketConfig } from './SFSocket';

const socketOptions: ISFSocketConfig = {
  host: 'test-socket.ws',
  port: 80,
  path: '',
  unavailableTimeout: 10000,
  useTLS: false,
};

const makeTestSocketUrl = (options: ISFSocketConfig) => {
  const scheme = `ws${options.useTLS ? 's' : ''}`;
  const host = options.useTLS ? (`${options.host}:${options.port}`) : (`${options.host}:${options.port}`);

  return `${scheme}://${host}/${options.path}`;
};

export { socketOptions, makeTestSocketUrl };
