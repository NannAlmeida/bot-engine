# 🤖 Framework de Bot Telegram

## 📖 Visão Geral

Este é um framework TypeScript modular e altamente abstrato para criação de bots Telegram. Ele separa completamente a lógica de negócio do código do framework, facilitando a criação e manutenção de bots.

## 🏗️ Arquitetura

### Estrutura de Diretórios

```
src/
├── framework/              # Core do framework
│   ├── core/              # Motor principal
│   │   ├── BotEngine.ts   # Engine do bot
│   │   └── SessionManager.ts  # Gerenciador de sessões
│   ├── types/             # Tipos e interfaces
│   │   ├── interfaces.ts  # Interfaces do framework
│   │   └── types.ts       # Tipos auxiliares
│   ├── plugins/           # Sistema de plugins
│   │   ├── Plugin.ts      # Classe base de plugin
│   │   └── Middleware.ts  # Sistema de middleware
│   └── utils/             # Utilitários
│       ├── Logger.ts      # Sistema de logging
│       └── MessageBuilder.ts  # Builder de mensagens
├── plugins/               # Plugins específicos
│   ├── payment/          # Plugin de pagamento
│   │   ├── PaymentPlugin.ts
│   │   └── pix/
│   │       └── PixGenerator.ts
│   ├── menu/             # Plugin de menu
│   │   └── MenuPlugin.ts
│   └── help/             # Plugin de ajuda
│       └── HelpPlugin.ts
├── app/                  # Aplicação do bot
│   ├── config/           # Configurações
│   │   └── bot.config.ts
│   └── bot.ts            # Bot principal
└── examples/             # Exemplos
    └── simple-bot.ts     # Exemplo simples
```

## 🚀 Como Usar

### 1. Bot Simples

```typescript
import { BotEngine, LoggingMiddleware } from './framework';

const bot = new BotEngine({
  token: 'SEU_TOKEN',
  name: 'Meu Bot',
  middleware: [new LoggingMiddleware()]
});

bot.registerCommand({
  command: 'start',
  handler: async (ctx) => {
    await ctx.reply('Olá! 👋');
  }
});

bot.launch();
```

### 2. Bot com Plugins

```typescript
import { BotEngine } from './framework';
import { MenuPlugin, HelpPlugin } from './plugins';

const bot = new BotEngine({ token: 'TOKEN' });

// Adicionar plugins
bot.addPlugin(new MenuPlugin());
bot.addPlugin(new HelpPlugin());

bot.launch();
```

### 3. Bot Completo (com Pagamentos)

Veja `src/app/bot.ts` para um exemplo completo.

## 🔌 Plugins Disponíveis

### PaymentPlugin

Gerencia pagamentos PIX:

```typescript
import { PaymentPlugin } from './plugins/payment/PaymentPlugin';

const paymentPlugin = new PaymentPlugin({
  method: 'pix',
  pix: {
    key: 'sua-chave-pix',
    merchantName: 'Seu Nome',
    merchantCity: 'Sua Cidade'
  }
});

// Gerar pagamento
const payment = await paymentPlugin.generatePaymentCode({
  amount: 10.00,
  description: 'Pagamento teste'
});
```

### MenuPlugin

Cria menus interativos:

```typescript
import { MenuPlugin, MenuBuilder } from './plugins/menu/MenuPlugin';

const menuPlugin = new MenuPlugin();

const menu = MenuBuilder.createMenuBuilder('main')
  .setText('Escolha uma opção:')
  .setLayout('grid', 2)
  .addItem('Opção 1', 'opt1')
  .addItem('Opção 2', 'opt2')
  .build();

menuPlugin.registerMenu(menu);
await menuPlugin.renderMenu(ctx, 'main');
```

### HelpPlugin

Sistema de ajuda:

```typescript
import { HelpPlugin } from './plugins/help/HelpPlugin';

const helpPlugin = new HelpPlugin({
  topics: [
    {
      id: 'start',
      title: 'Como começar',
      content: 'Use /start para iniciar!'
    }
  ]
});
```

## 🛠️ Middleware

O framework suporta middleware para processar requisições:

```typescript
import { LoggingMiddleware, RateLimitMiddleware } from './framework';

const bot = new BotEngine({
  token: 'TOKEN',
  middleware: [
    new LoggingMiddleware(),
    new RateLimitMiddleware(10, 60000) // 10 req/min
  ]
});
```

### Middleware Disponíveis

- **LoggingMiddleware**: Log de todas as mensagens
- **AuthMiddleware**: Autenticação de usuários
- **RateLimitMiddleware**: Limite de taxa de requisições
- **ErrorHandlerMiddleware**: Tratamento de erros

## 📝 Criando um Plugin Customizado

```typescript
import { Plugin } from './framework/plugins/Plugin';

export class MeuPlugin extends Plugin {
  name = 'meu-plugin';
  version = '1.0.0';
  description = 'Meu plugin customizado';

  async register(): Promise<void> {
    this.engine.registerCommand({
      command: 'meucomando',
      handler: async (ctx) => {
        await ctx.reply('Olá do meu plugin!');
      }
    });
  }
}
```

## 🎯 Handlers

### Comandos

```typescript
bot.registerCommand({
  command: 'start',
  description: 'Inicia o bot',
  handler: async (ctx) => {
    await ctx.reply('Bot iniciado!');
  }
});
```

### Ações (Callback Queries)

```typescript
bot.registerAction({
  action: 'btn_click',
  handler: async (ctx) => {
    await ctx.reply('Botão clicado!');
  }
});
```

### Mensagens

```typescript
bot.registerMessage({
  pattern: /^hello$/i,
  handler: async (ctx) => {
    await ctx.reply('Hello!');
  }
});
```

## 💾 Sessões

O framework possui gerenciamento de sessões integrado:

```typescript
const bot = new BotEngine({
  token: 'TOKEN',
  session: {
    enabled: true,
    ttl: 3600 // 1 hora
  }
});

// Usar sessão
bot.registerCommand({
  command: 'counter',
  handler: async (ctx) => {
    if (!ctx.session) return;
    
    ctx.session.data.count = (ctx.session.data.count || 0) + 1;
    await ctx.reply(`Contador: ${ctx.session.data.count}`);
  }
});
```

## 🔧 Configuração

Todas as configurações devem ficar em arquivos separados:

```typescript
// config/bot.config.ts
export const botConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  name: 'Meu Bot',
  session: {
    enabled: true,
    ttl: 3600
  }
};
```

## 📊 Logging

```typescript
import { ConsoleLogger } from './framework';

const logger = new ConsoleLogger('debug');

logger.info('Bot iniciado');
logger.error('Erro!', new Error('Ops'));
logger.debug('Debug info');
```

## 🚦 Scripts

```bash
# Compilar TypeScript
npm run build

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start

# Executar exemplo simples
npm run example

# Executar bot legado (JS)
npm run legacy
```

## 🎨 MessageBuilder

Construtor fluente para mensagens:

```typescript
import { MessageBuilder } from './framework';

const message = MessageBuilder.create()
  .setText('Escolha uma opção:')
  .setParseMode('Markdown')
  .addButton('Botão 1', 'btn1')
  .addButton('Botão 2', 'btn2')
  .addButtonRow()
  .addUrlButton('Site', 'https://example.com')
  .build();

await ctx.reply(message.text, message.markup);
```

## 🔐 Validações

### Validar Chave PIX

```typescript
import { PixGenerator } from './plugins/payment/pix/PixGenerator';

const isValid = PixGenerator.validatePixKey('sua-chave-pix');
```

## 🌟 Benefícios do Framework

1. **Separação de Responsabilidades**: Lógica de negócio separada do framework
2. **Reutilizável**: Crie um bot, reutilize em outros projetos
3. **Extensível**: Sistema de plugins para adicionar funcionalidades
4. **Type-Safe**: TypeScript com tipagem completa
5. **Testável**: Código modular e fácil de testar
6. **Manutenível**: Código organizado e bem documentado

## 📦 Dependências

```json
{
  "telegraf": "^4.15.0",
  "dotenv": "^16.3.1",
  "crc": "^4.3.2",
  "qrcode": "^1.5.3",
  "typescript": "^5.3.2"
}
```

## 🤝 Contribuindo

1. Crie plugins customizados
2. Adicione middleware úteis
3. Melhore a documentação
4. Reporte bugs

## 📄 Licença

MIT

