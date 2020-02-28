import { ISFSocketEvent } from './SFSocket';
export declare enum SystemEvents {
    CHANNEL_JOINED = "@join",
    CHANNEL_JOIN_FAILED = "#join",
    CHANNEL_LEFT = "@leave",
    CHANNEL_LEAVE_FAILED = "#leave"
}
export declare const SystemTopics: Set<string>;
export declare const decodeMessage: (messageEvent: string | null) => ISFSocketEvent;
export declare const encodeMessage: (event: {
    type: string;
    payload: any;
}) => string;
export declare const prepareCloseAction: (closeEvent: ISFSocketEvent) => ISFSocketEvent;
//# sourceMappingURL=messageCodingUtils.d.ts.map