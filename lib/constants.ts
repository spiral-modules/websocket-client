import { ISFSocketConfig } from './SFSocket';
import { retryStrategy } from './retrystrategy';

export const defaultConfig: ISFSocketConfig = {
  host: '',
  port: 80,
  path: '',
  unavailableTimeout: 10000,
  retryTimeout: 10,
  useTLS: false,
  retryStrategy: retryStrategy({ retries: 3, delay: 1000, multiplier: 5 }),
};
