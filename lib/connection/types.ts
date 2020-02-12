export interface IAction {
    action: string;
    id?: string;
    error?: any; // TODO
}

export interface IErrorCallbacks {
    refused: (result: IAction) => void;
    unavailable: (result: IAction) => void;
}

export interface IConnectionCallbacks {
    message: (message: any) => void; // TODO
    error: (error: any) => void; // TODO
    closed: (reason: any) => void; // TODO
}
