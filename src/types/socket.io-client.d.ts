declare module 'socket.io-client' {
  interface Socket {
    id: string;
    connected: boolean;
    emit(event: string, ...args: any[]): Socket;
    on(event: string, fn: (...args: any[]) => void): Socket;
    off(event: string, fn?: (...args: any[]) => void): Socket;
    disconnect(): Socket;
  }

  function io(uri: string, opts?: any): Socket;
  export = io;
}
