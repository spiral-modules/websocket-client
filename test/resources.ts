import { ISFSocketConfig } from '../lib/sfSocket';


const socketOptions: ISFSocketConfig = {
  host: 'test-socket.ws',
  port: 80,
  portTLS: 443,
  path: '',
  unavailableTimeout: 10000,
  useTLS: false,
  useStorage: false,
};


const makeTestSocketUrl = (options: ISFSocketConfig) => {
  const scheme = `ws${options.useTLS ? 's' : ''}`;
  const host = options.useTLS ? (`${options.host}:${options.portTLS}`) : (`${options.host}:${options.port}`);

  return `${scheme}://${host}/${options.path}`;
};

export { socketOptions, makeTestSocketUrl };
