export interface IAction {
    action: string;
    id?: string;
    error?: any;
}
export interface IErrorCallbacks {
    refused: (result: IAction) => void;
    unavailable: (result: IAction) => void;
}
export interface IConnectionCallbacks {
    message: (message: any) => void;
    error: (error: any) => void;
    closed: (reason: any) => void;
}
//# sourceMappingURL=types.d.ts.map