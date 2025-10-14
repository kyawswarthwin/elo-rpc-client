import { WebSocket } from 'elo-isomorphic-ws';
import { ELOInfer, eloPack, ELOSchema, eloUnpack } from 'elo-serializer';

export class ELORpcClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private schema = {
    requestId: 'uint32',
    type: 'binary',
    payload: 'binary',
  } as const satisfies ELOSchema;

  constructor(
    private url: string,
    private headers?: HeadersInit,
  ) {}

  connect(): Promise<void> {
    this.disconnect();
    this.ws = new WebSocket(this.url, {
      headers: this.headers,
    });
    this.ws.binaryType = 'arraybuffer';

    return new Promise((resolve, reject) => {
      this.ws!.onopen = () => resolve();
      this.ws!.onerror = () =>
        setTimeout(() => this.connect().then(resolve).catch(reject), 1000);
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  call<T, P extends Record<string, unknown>>(
    method: string,
    params: P = {} as P,
  ): Promise<T> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected!');
    }

    const requestId = this.requestId++;
    const encoder = new TextEncoder();
    const data: ELOInfer<typeof this.schema> = {
      requestId,
      type: encoder.encode(method).buffer,
      payload: encoder.encode(JSON.stringify(params)).buffer,
    };

    this.ws.send(eloPack(this.schema, data));

    return new Promise((resolve) => {
      const handler = (event: MessageEvent) => {
        try {
          const message = this.handleMessage(event.data);

          if (message.requestId === requestId && message.type === method) {
            this.ws!.removeEventListener('message', handler);
            resolve(message.payload as T);
          }
        } catch {}
      };

      this.ws!.addEventListener('message', handler);
    });
  }

  private handleMessage(data: ArrayBuffer): {
    requestId: number;
    type: string;
    payload: unknown;
  } {
    const { requestId, type, payload } = eloUnpack(this.schema, data);
    const decoder = new TextDecoder();

    return {
      requestId,
      type: decoder.decode(type),
      payload: JSON.parse(decoder.decode(payload)),
    };
  }
}
