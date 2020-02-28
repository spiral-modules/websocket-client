import { ISFSocketConfig } from './SFSocket';

export const defaultConfig: ISFSocketConfig = {
  host: '',
  port: 80,
  portTLS: 443,
  path: '',
  unavailableTimeout: 10000,
  useTLS: false,
};
