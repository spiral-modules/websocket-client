import { ISFSocketEvent } from '../SFSocket';
import { RetryStrategy } from '../connection/types';

export interface IRetryState {
  delay: number;
  retry: number;
}

export const INFINITE_RETRIES = -1;

export const delay = async (d: number) => new Promise((resolve) => {
  setTimeout(resolve, d);
});

export const retryStrategy = (
  options: { retries?: number, delay?: number, multiplier?: number },
): RetryStrategy => async (event: ISFSocketEvent, prevState?: unknown) => {
  const state = prevState as (IRetryState | undefined);
  if (options.retries === INFINITE_RETRIES) {
    return Promise.resolve({ retry: true, state: undefined });
  }
  if (options.retries === 0) {
    return Promise.resolve({ retry: false, state: undefined });
  }
  const multiplier = options.multiplier ?? 1;
  const retriesAllowed = options.retries ?? 1;
  const retriesDone = state?.retry ?? 0;
  const newDelay = (state?.delay) ? (state.delay * multiplier) : (options.delay ?? 0);

  if (retriesDone < retriesAllowed) {
    await delay(newDelay);
    return Promise.resolve({ retry: true, state: { delay: newDelay, retry: retriesDone + 1 } });
  }
  return Promise.resolve({ retry: true, state: undefined });
};
