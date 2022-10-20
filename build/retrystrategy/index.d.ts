import { RetryStrategy } from '../connection/types';
export interface IRetryState {
    delay: number;
    retry: number;
}
export declare const INFINITE_RETRIES = -1;
export declare const delay: (d: number) => Promise<unknown>;
export declare const retryStrategy: (options: {
    retries?: number;
    delay?: number;
    multiplier?: number;
}) => RetryStrategy;
//# sourceMappingURL=index.d.ts.map