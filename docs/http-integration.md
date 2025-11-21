# Integração HTTP - Bot Engine

O Bot Engine permite integrar um servidor HTTP (Express) diretamente com seu bot Telegram, possibilitando criar APIs REST, webhooks e integrações com sistemas externos.

## Índice

- [Configuração](#configuração)
- [Servidor HTTP](#servidor-http)
- [Rotas Padrão](#rotas-padrão)
- [Rotas Customizadas](#rotas-customizadas)
- [Webhooks](#webhooks)
- [Exemplos Práticos](#exemplos-práticos)
- [Segurança](#segurança)
- [Deploy](#deploy)

## Configuração

### Habilitando o Servidor HTTP

Para habilitar o servidor HTTP, adicione a configuração `http` ao criar o bot:

```typescript
import { BotEngine } from 'bot-engine-telegram';

const bot = new BotEngine({
  token: process.env.BOT_TOKEN!,
  name: 'Meu Bot',
  http: {
    enabled: true,
    port: 3000,
    host: 'localhost',
    cors: true
  }
});
```

### Opções de Configuração

```typescript
interface HttpServerConfig {
  enabled: boolean;          // Habilita/desabilita servidor HTTP
  port?: number;             // Porta (padrão: 3000)
  host?: string;             // Host (padrão: 'localhost')
  cors?: boolean | {         // Configuração CORS
    origin?: string | string[];
    credentials?: boolean;
  };
}
```

### Exemplo com CORS Customizado

```typescript
const bot = new BotEngine({
  token: process.env.BOT_TOKEN!,
  http: {
    enabled: true,
    port: 3000,
    cors: {
      origin: ['https://meusite.com', 'https://admin.meusite.com'],
      credentials: true
    }
  }
});
```

## Servidor HTTP

### Acessando o Servidor

```typescript
const httpServer = bot.getHttpServer();

if (httpServer) {
  // Servidor está habilitado
  console.log(`Porta: ${httpServer.getPort()}`);
  console.log(`Host: ${httpServer.getHost()}`);
}
```

### Métodos Disponíveis

```typescript
// GET
httpServer.get('/path', (req, res) => {
  res.json({ message: 'GET' });
});

// POST
httpServer.post('/path', (req, res) => {
  res.json({ message: 'POST' });
});

// PUT
httpServer.put('/path', (req, res) => {
  res.json({ message: 'PUT' });
});

// DELETE
httpServer.delete('/path', (req, res) => {
  res.json({ message: 'DELETE' });
});

// Middleware
httpServer.use((req, res, next) => {
  console.log('Middleware executado');
  next();
});
```

## Rotas Padrão

O Bot Engine configura automaticamente algumas rotas úteis:

### `GET /`

Informações básicas do bot.

```bash
curl http://localhost:3000/
```

**Resposta:**

```json
{
  "name": "Meu Bot",
  "description": "Bot Telegram",
  "version": "1.2.0",
  "endpoints": {
    "health": "/health",
    "status": "/status"
  }
}
```

### `GET /health`

Health check do servidor.

```bash
curl http://localhost:3000/health
```

**Resposta:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 123.456
}
```

### `GET /status`

Status detalhado do bot e servidor.

```bash
curl http://localhost:3000/status
```

**Resposta:**

```json
{
  "status": "online",
  "bot": {
    "id": 123456789,
    "username": "meu_bot",
    "name": "Meu Bot"
  },
  "server": {
    "uptime": 123.456,
    "memory": {
      "rss": 50331648,
      "heapTotal": 18874368,
      "heapUsed": 15359456,
      "external": 1234567
    },
    "timestamp": "2024-01-20T10:30:00.000Z"
  }
}
```

## Rotas Customizadas

### Criando Rotas Simples

```typescript
const httpServer = bot.getHttpServer();

if (httpServer) {
  // Rota GET simples
  httpServer.get('/users', (req, res) => {
    res.json({
      users: [
        { id: 1, name: 'João' },
        { id: 2, name: 'Maria' }
      ]
    });
  });

  // Rota POST com body
  httpServer.post('/users', (req, res) => {
    const { name, email } = req.body;
    
    // Validação
    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios'
      });
    }

    // Processar dados
    const newUser = { id: Date.now(), name, email };
    
    res.status(201).json(newUser);
  });
}
```

### Rotas com Parâmetros

```typescript
httpServer.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Buscar usuário
  const user = { id: userId, name: 'João' };
  
  res.json(user);
});
```

### Rotas com Query Strings

```typescript
httpServer.get('/search', (req, res) => {
  const { q, limit = 10 } = req.query;
  
  res.json({
    query: q,
    limit: parseInt(limit as string),
    results: []
  });
});
```

## Webhooks

### Webhook Básico

Rota para receber dados de sistemas externos:

```typescript
httpServer.post('/webhook/notification', async (req, res) => {
  try {
    const { chatId, message } = req.body;

    // Validação
    if (!chatId || !message) {
      return res.status(400).json({
        error: 'chatId e message são obrigatórios'
      });
    }

    // Enviar mensagem via Telegram
    const telegram = bot.getTelegrafInstance().telegram;
    await telegram.sendMessage(chatId, message);

    res.json({
      success: true,
      message: 'Notificação enviada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar notificação'
    });
  }
});
```

**Uso:**

```bash
curl -X POST http://localhost:3000/webhook/notification \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "123456789",
    "message": "Olá do webhook!"
  }'
```

### Webhook com Autenticação

```typescript
// Middleware de autenticação
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  next();
};

// Usar middleware na rota
httpServer.post('/webhook/secure', authenticate, async (req, res) => {
  // Processar webhook autenticado
  res.json({ success: true });
});
```

**Uso:**

```bash
curl -X POST http://localhost:3000/webhook/secure \
  -H "Authorization: Bearer seu_token_secreto" \
  -H "Content-Type: application/json" \
  -d '{"data": "valor"}'
```

### Webhook para Pagamentos

Exemplo de webhook para notificações de pagamento:

```typescript
httpServer.post('/webhook/payment', async (req, res) => {
  try {
    const { orderId, status, amount, customer } = req.body;

    bot.getLogger().info(`Pagamento recebido: ${orderId} - ${status}`);

    let message = '';
    
    switch (status) {
      case 'approved':
        message = `✅ *Pagamento Aprovado*\n\n` +
                 `Pedido: ${orderId}\n` +
                 `Valor: R$ ${amount.toFixed(2)}\n` +
                 `Cliente: ${customer.name}`;
        break;
      
      case 'pending':
        message = `⏳ *Pagamento Pendente*\n\n` +
                 `Pedido: ${orderId}\n` +
                 `Aguardando confirmação...`;
        break;
      
      case 'rejected':
        message = `❌ *Pagamento Rejeitado*\n\n` +
                 `Pedido: ${orderId}\n` +
                 `Entre em contato com o cliente.`;
        break;
    }

    // Enviar notificação
    const telegram = bot.getTelegrafInstance().telegram;
    await telegram.sendMessage(
      process.env.ADMIN_CHAT_ID!,
      message,
      { parse_mode: 'Markdown' }
    );

    res.json({ success: true });
  } catch (error) {
    bot.getLogger().error('Erro no webhook de pagamento', error as Error);
    res.status(500).json({ success: false });
  }
});
```

## Exemplos Práticos

### 1. Integração com CRM

```typescript
// Webhook quando um novo lead é criado
httpServer.post('/webhook/crm/lead', async (req, res) => {
  const { name, email, phone, source } = req.body;

  const message = `🎯 *Novo Lead!*\n\n` +
                 `Nome: ${name}\n` +
                 `Email: ${email}\n` +
                 `Telefone: ${phone}\n` +
                 `Origem: ${source}`;

  await bot.getTelegrafInstance().telegram.sendMessage(
    process.env.SALES_CHAT_ID!,
    message,
    { parse_mode: 'Markdown' }
  );

  res.json({ success: true });
});
```

### 2. Monitoramento de Servidor

```typescript
// Endpoint para receber alertas de monitoramento
httpServer.post('/webhook/monitoring/alert', async (req, res) => {
  const { severity, service, message, details } = req.body;

  const emojis: Record<string, string> = {
    critical: '🔴',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const alert = `${emojis[severity]} *Alerta: ${service}*\n\n` +
               `${message}\n\n` +
               `_${details}_`;

  await bot.getTelegrafInstance().telegram.sendMessage(
    process.env.OPS_CHAT_ID!,
    alert,
    { parse_mode: 'Markdown' }
  );

  res.json({ success: true });
});
```

### 3. Sistema de Tickets

```typescript
// Criar ticket
httpServer.post('/api/tickets', async (req, res) => {
  const { userId, subject, description } = req.body;

  const ticketId = Date.now();
  
  // Salvar ticket (banco de dados)
  // ...

  // Notificar suporte
  const message = `🎫 *Novo Ticket #${ticketId}*\n\n` +
                 `Usuário: ${userId}\n` +
                 `Assunto: ${subject}\n` +
                 `Descrição: ${description}`;

  await bot.getTelegrafInstance().telegram.sendMessage(
    process.env.SUPPORT_CHAT_ID!,
    message,
    { parse_mode: 'Markdown' }
  );

  res.json({
    success: true,
    ticketId
  });
});
```

## Segurança

### 1. Validação de Entrada

```typescript
httpServer.post('/webhook/data', (req, res) => {
  const { email, amount } = req.body;

  // Validar email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  // Validar amount
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  // Processar...
  res.json({ success: true });
});
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requisições
});

const app = bot.getHttpServer()?.getApp();
if (app) {
  app.use('/webhook', limiter);
}
```

### 3. Tokens de Autenticação

```typescript
const VALID_TOKENS = new Set([
  process.env.WEBHOOK_TOKEN_1,
  process.env.WEBHOOK_TOKEN_2
]);

const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers['x-webhook-token'];
  
  if (!VALID_TOKENS.has(token)) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  next();
};

httpServer.use('/webhook', verifyToken);
```

## Deploy

### Variáveis de Ambiente

```env
# Bot
BOT_TOKEN=seu_token_aqui

# HTTP
PORT=3000
HOST=0.0.0.0

# Segurança
WEBHOOK_SECRET=seu_secret_aqui
CORS_ORIGIN=https://seudominio.com

# Notificações
ADMIN_CHAT_ID=123456789
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name bot.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Recursos Adicionais

- [Express.js Documentation](https://expressjs.com/)
- [Exemplos](../examples/http-bot.ts)
- [CLI](./cli.md)
- [Framework](./framework.md)

## Próximos Passos

- Explore os [exemplos completos](../examples/)
- Aprenda sobre [plugins e middleware](./framework.md)
- Configure [webhooks do Telegram](https://core.telegram.org/bots/webhooks)

