import { ICallback, ICallbackTable, UEventCallback } from '../types';
export default class CallbackRegistry<EventMap> {
    callbacks: ICallbackTable<EventMap>;
    get<K extends keyof EventMap>(name: K): ICallback[];
    add<K extends keyof EventMap>(name: K, callback: UEventCallback<EventMap, K>, channel?: string): void;
    remove<K extends keyof EventMap>(name: K, callback?: UEventCallback<EventMap, K>, channel?: string): void;
    private removeCallback;
    private removeAllCallbacks;
}
//# sourceMappingURL=CallbackRegistry.d.ts.map