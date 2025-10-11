# elo-rpc-client

Lightweight, WebSocket RPC client with [`elo-serializer`](https://www.npmjs.com/package/elo-serializer) for binary serialization

## Installation

```bash
npm install elo-rpc-client
```

## Usage

```typescript
import { ELORpcClient } from 'elo-rpc-client';

const client = new ELORpcClient('ws://example.com');
await client.connect();
const result = await client.call<string>('method', { param: 'value' });
console.log(result);
client.disconnect();
```

## License

MIT
