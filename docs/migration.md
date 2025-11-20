# 🔄 Guia de Migração: Bot Legado → Framework

## 📋 Visão Geral

Este guia ajuda a migrar bots existentes para o novo framework TypeScript.

## 🆚 Diferenças Principais

### Estrutura de Código

**Antes (bot.js):**
```javascript
const { Telegraf } = require('telegraf');
const bot = new Telegraf(TOKEN);

bot.start((ctx) => {
  // Código acoplado
});

bot.action('button', async (ctx) => {
  // Lógica misturada
});

bot.launch();
```

**Depois (bot.ts):**
```typescript
import { BotEngine } from './framework';

class MyBot {
  private engine: BotEngine;
  
  constructor() {
    this.engine = new BotEngine({ token: TOKEN });
    this.registerHandlers();
  }
  
  private registerHandlers() {
    this.engine.registerCommand({
      command: 'start',
      handler: (ctx) => this.handleStart(ctx)
    });
  }
  
  async start() {
    await this.engine.launch();
  }
}
```

## 📝 Passo a Passo

### 1. Configuração Inicial

**Criar `src/app/config/bot.config.ts`:**

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const botConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  name: 'Meu Bot',
  session: {
    enabled: true,
    ttl: 3600
  }
};
```

### 2. Migrar Comandos

**Antes:**
```javascript
bot.start((ctx) => {
  ctx.reply('Olá!');
});

bot.command('ajuda', (ctx) => {
  ctx.reply('Ajuda aqui');
});
```

**Depois:**
```typescript
this.engine.registerCommand({
  command: 'start',
  handler: async (ctx) => {
    await ctx.reply('Olá!');
  }
});

this.engine.registerCommand({
  command: 'ajuda',
  handler: async (ctx) => {
    await ctx.reply('Ajuda aqui');
  }
});
```

### 3. Migrar Actions (Botões)

**Antes:**
```javascript
bot.action('btn_1', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Botão 1 clicado');
});
```

**Depois:**
```typescript
this.engine.registerAction({
  action: 'btn_1',
  handler: async (ctx) => {
    // answerCbQuery é chamado automaticamente
    await ctx.reply('Botão 1 clicado');
  }
});
```

### 4. Migrar Lógica de Negócio para Plugins

**Antes (lógica misturada no bot.js):**
```javascript
bot.action('pagar', async (ctx) => {
  const pixCode = gerarPixCopiaCola({
    chave: PIX_KEY,
    valor: 10.00,
    nomeBeneficiario: MERCHANT_NAME,
    cidade: MERCHANT_CITY
  });
  
  await ctx.reply(`Código PIX: ${pixCode}`);
});
```

**Depois (usando plugin):**
```typescript
// Plugin de pagamento já implementado
this.paymentPlugin = new PaymentPlugin({
  method: 'pix',
  pix: pixConfig
});

this.engine.addPlugin(this.paymentPlugin);

// Handler simplificado
private async handlePayment(ctx: BotContext, amount: number) {
  const payment = await this.paymentPlugin.generatePaymentCode({
    amount,
    description: `Pagamento de R$ ${amount}`
  });
  
  await ctx.reply(`Código PIX: ${payment.code}`);
}
```

### 5. Adicionar Middleware

**Novo recurso - Antes não existia:**

```typescript
import { LoggingMiddleware, RateLimitMiddleware } from './framework';

const bot = new BotEngine({
  token: TOKEN,
  middleware: [
    new LoggingMiddleware(),
    new RateLimitMiddleware(10, 60000)
  ]
});
```

### 6. Usar Sessões

**Novo recurso - Antes não existia:**

```typescript
// Configurar
const bot = new BotEngine({
  token: TOKEN,
  session: { enabled: true, ttl: 3600 }
});

// Usar
bot.registerCommand({
  command: 'counter',
  handler: async (ctx) => {
    ctx.session.data.count = (ctx.session.data.count || 0) + 1;
    await ctx.reply(`Contagem: ${ctx.session.data.count}`);
  }
});
```

## 🔧 Checklist de Migração

- [ ] Instalar dependências TypeScript
- [ ] Criar estrutura `src/` com subpastas
- [ ] Mover variáveis de ambiente para `.env`
- [ ] Criar arquivos de configuração em `config/`
- [ ] Migrar comandos para `registerCommand()`
- [ ] Migrar actions para `registerAction()`
- [ ] Extrair lógica de negócio para plugins
- [ ] Adicionar middleware se necessário
- [ ] Configurar sessões se necessário
- [ ] Atualizar scripts no `package.json`
- [ ] Testar o bot
- [ ] Compilar com `npm run build`

## 📊 Benefícios da Migração

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Type Safety** | ❌ Sem tipos | ✅ TypeScript |
| **Organização** | ❌ Monolítico | ✅ Modular |
| **Reutilização** | ❌ Código duplicado | ✅ Plugins |
| **Manutenção** | ❌ Difícil | ✅ Fácil |
| **Testes** | ❌ Complexo | ✅ Simples |
| **Escalabilidade** | ❌ Limitada | ✅ Alta |
| **Middleware** | ❌ Não tem | ✅ Tem |
| **Sessões** | ❌ Manual | ✅ Integrado |

## 🚀 Exemplo Completo de Migração

### Bot Legado (bot.js)

```javascript
const { Telegraf, Markup } = require('telegraf');
const { gerarPixCopiaCola } = require('./pix-generator');
const QRCode = require('qrcode');

const bot = new Telegraf(TOKEN);

const VALORES = {
  'valor_1': { valor: 10.00, descricao: 'R$ 10,00' }
};

bot.start((ctx) => {
  const buttons = Object.entries(VALORES).map(([key, info]) => 
    [Markup.button.callback(info.descricao, key)]
  );
  ctx.reply('Escolha um valor:', Markup.inlineKeyboard(buttons));
});

bot.action('valor_1', async (ctx) => {
  await ctx.answerCbQuery();
  const pixCode = gerarPixCopiaCola({
    chave: PIX_KEY,
    valor: VALORES['valor_1'].valor,
    nomeBeneficiario: MERCHANT_NAME,
    cidade: MERCHANT_CITY
  });
  const qrCode = await QRCode.toBuffer(pixCode);
  await ctx.reply(`Código: ${pixCode}`);
  await ctx.replyWithPhoto({ source: qrCode });
});

bot.launch();
```

### Bot com Framework (bot.ts)

```typescript
import { BotEngine, BotContext } from './framework';
import { PaymentPlugin } from './plugins/payment/PaymentPlugin';
import { botConfig, pixConfig, paymentValues } from './config/bot.config';
import { Markup } from 'telegraf';

class PaymentBot {
  private engine: BotEngine;
  private paymentPlugin: PaymentPlugin;

  constructor() {
    this.engine = new BotEngine(botConfig);
    this.paymentPlugin = new PaymentPlugin({
      method: 'pix',
      pix: pixConfig
    });
    
    this.engine.addPlugin(this.paymentPlugin);
    this.registerHandlers();
  }

  private registerHandlers() {
    this.engine.registerCommand({
      command: 'start',
      handler: (ctx) => this.handleStart(ctx)
    });

    Object.keys(paymentValues).forEach(key => {
      this.engine.registerAction({
        action: key,
        handler: (ctx) => this.handlePayment(ctx, key)
      });
    });
  }

  private async handleStart(ctx: BotContext) {
    const buttons = Object.entries(paymentValues).map(([key, info]) => 
      [Markup.button.callback(info.descricao, key)]
    );
    await ctx.reply('Escolha um valor:', Markup.inlineKeyboard(buttons));
  }

  private async handlePayment(ctx: BotContext, valorKey: string) {
    const info = paymentValues[valorKey];
    
    const payment = await this.paymentPlugin.generatePaymentCode({
      amount: info.valor,
      description: `Pagamento de ${info.descricao}`
    });
    
    await ctx.reply(`Código PIX: \`${payment.code}\``, {
      parse_mode: 'Markdown'
    });
    
    await ctx.replyWithPhoto({ source: payment.qrCode! });
  }

  async start() {
    await this.engine.launch();
  }
}

const bot = new PaymentBot();
bot.start();
```

## 💡 Dicas

1. **Migre gradualmente**: Comece com comandos simples
2. **Use plugins**: Extraia lógicas complexas para plugins
3. **Configure bem**: Separe configurações em arquivos
4. **Teste bastante**: Teste cada funcionalidade após migrar
5. **Aproveite TypeScript**: Use tipos para evitar erros

## 🔗 Recursos

- [README.md](README.md) - Visão geral do framework
- [FRAMEWORK.md](FRAMEWORK.md) - Documentação detalhada
- [src/examples/](src/examples/) - Exemplos práticos
- [src/app/bot.ts](src/app/bot.ts) - Bot completo migrado

## ❓ FAQ

**P: Posso usar o bot legado e o novo ao mesmo tempo?**  
R: Sim! Use `npm run legacy` para o antigo e `npm run dev` para o novo.

**P: Preciso reescrever tudo?**  
R: Não! Migre aos poucos, começando pelos comandos principais.

**P: E se eu tiver funções customizadas?**  
R: Transforme-as em plugins para reutilização.

**P: O bot legado para de funcionar?**  
R: Não! O arquivo `bot.js` original continua funcionando normalmente.

---

**Boa migração! 🚀**

