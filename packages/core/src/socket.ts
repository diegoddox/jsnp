import { CreateSocketOptions, CoreSocket } from '@jsnp/type';

const DEFAULT_OPTIONS: CreateSocketOptions = {
  name: '@jsnp',
  host: 'localhost',
  port: 1338,
  secure: false,
};

export class Socket implements CoreSocket{
  private socket: WebSocket | null = null;
  private isReady: boolean = false;
  private sendQueue: any[] = [];
  private options: CreateSocketOptions = {};

  constructor() {
    this.send = this.send.bind(this);
    this.sendPerformance = this.sendPerformance.bind(this);
  }

  public configure(options: CreateSocketOptions = {}): Socket {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    return this;
  }

  public connect(): Socket {
    const {
      host,
      port,
      secure,
      onConnect,
      onMessage,
      onClose,
      onError
    } = this.options;
  
    const protocol = secure ? 'wss' : 'ws';
    const socket = new WebSocket(`${protocol}://${host}:${port}`);

    socket.onopen = (e: Event) => {
      this.isReady = true;

      onConnect && onConnect(e);

      // Fire what we have in the queue
      while (this.sendQueue.length > 0) {
        const queueData = this.sendQueue[0];
        this.sendQueue = this.sendQueue.splice(1);
        socket.send(queueData);
      }
    };
  
    socket.onmessage = (e: MessageEvent) => {
      onMessage && onMessage(e);
    };
  
    socket.onerror = (e) => {
      this.isReady = false;
      this.socket = null;
      onError && onError(e);

      console.log(`
       _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
      |                                                                         |
      |  NPerformance: We're not able to connect to the NPerformance-Monitor,   |
      |  make sure that the application is running and reload you Application.  |
      | _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ |
      `);
    };
  
    socket.onclose = (e) => {
      this.isReady = false;
      this.socket = null;
      onClose && onClose(e);
    };

    this.socket = socket;
    return this;
  }

  public send(data: object) {
    const stringData = JSON.stringify(data);

    if (this.isReady && this.socket) {
      this.socket.send(stringData);
    } else {
      this.sendQueue.push(stringData);
    }
  }

  public sendPerformance(data: object) {
    // Use this to send data to the @jsnp/monitor.
    this.send({
      applicationName: this.options.name,
      type: 'SOCKET:PERFORMANCE_DATA',
      data,
    });
  }
}

export function createSocket(config: CreateSocketOptions): CoreSocket {
  const socket = new Socket();
  socket.configure(config);
  return socket;
}