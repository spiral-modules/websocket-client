import { ISFSocketEvent } from '../SFSocket';

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
    channelJoined: (channels: string[]) => void;
    channelJoinFailed: (channels: string[]) => void;
    channelLeft: (channels: string[]) => void;
    message: (message: ISFSocketEvent) => void; // TODO
    error: (error: ISFSocketEvent) => void; // TODO
    closed: (reason: any) => void; // TODO
}
