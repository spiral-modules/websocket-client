export {};

declare global {
    interface Window {
        WebSocket?: WebSocket;
    }
}