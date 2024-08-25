export interface ElectronAPI {
    ipcRenderer: {
        send: (channel: string, data?: any) => void;
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
    };
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}