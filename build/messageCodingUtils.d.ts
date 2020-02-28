import { ISFSocketEvent } from './SFSocket';
export declare const decodeMessage: (messageEvent: string | null) => ISFSocketEvent;
export declare const encodeMessage: (event: ISFSocketEvent) => string;
export declare const prepareCloseAction: (closeEvent: ISFSocketEvent) => ISFSocketEvent;
//# sourceMappingURL=messageCodingUtils.d.ts.map