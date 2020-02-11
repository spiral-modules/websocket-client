interface ICallback {
    fn: Function;
    channel: string | null;
}
interface ICallbackTable {
    [index: string]: ICallback[];
}
export default class CallbackRegistry {
    callbacks: ICallbackTable;
    constructor();
    get(name: string): ICallback[];
    add(name: string, callback: Function, channel?: string): void;
    remove(name?: string, callback?: Function, channel?: string): void;
    private removeCallback;
    private removeAllCallbacks;
}
export {};
