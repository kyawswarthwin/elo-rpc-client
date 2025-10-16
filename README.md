# elo-rpc-client

Lightweight, WebSocket RPC client with [`elo-isomorphic-ws`](https://www.npmjs.com/package/elo-isomorphic-ws) for cross-platform WebSocket support and [`elo-serializer`](https://www.npmjs.com/package/elo-serializer) for binary serialization

## Installation

```bash
npm install elo-rpc-client
```

## Usage

```typescript
import { ELORpcClient } from 'elo-rpc-client';

const client = new ELORpcClient('wss://echo.websocket.org');
await client.connect();
const result = await client.call<string>('method', { param: 'value' });
console.log(result);
client.disconnect();
```

## License

MIT
