export interface ICallback {
    fn: Function;
    channel: string | null;
}

export interface ICallbackTable {
    [index: string]: ICallback[];
}
