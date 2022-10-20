import { ISFSocketEvent } from '../SFSocket';
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
    channelJoined: (channels: string[]) => void;
    channelJoinFailed: (channels: string[]) => void;
    channelLeft: (channels: string[]) => void;
    message: (message: ISFSocketEvent) => void;
    error: (error: ISFSocketEvent) => void;
    closed: (reason: any) => void;
}
//# sourceMappingURL=types.d.ts.map