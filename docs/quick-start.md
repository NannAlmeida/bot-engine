# ⚡ Quick Start - Framework de Bot Telegram

## 🚀 Criar um Novo Bot em 5 Minutos

### Passo 1: Configurar Token

Crie ou edite o arquivo `.env`:

```env
TELEGRAM_BOT_TOKEN=seu_token_aqui
```

### Passo 2: Criar o Bot

Crie `meu-bot.ts`:

```typescript
import { BotEngine, LoggingMiddleware } from './src/framework';

// Configuração
const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  name: 'Meu Bot',
  middleware: [new LoggingMiddleware()],
  session: {
    enabled: true,
    ttl: 3600
  }
});

// Comando /start
bot.registerCommand({
  command: 'start',
  description: 'Inicia o bot',
  handler: async (ctx) => {
    const nome = ctx.from?.first_name || 'usuário';
    await ctx.reply(`👋 Olá, ${nome}! Bem-vindo ao meu bot!`);
  }
});

// Comando /ajuda
bot.registerCommand({
  command: 'ajuda',
  handler: async (ctx) => {
    await ctx.reply(
      'ℹ️ *Comandos Disponíveis:*\n\n' +
      '/start - Inicia o bot\n' +
      '/ajuda - Mostra esta mensagem',
      { parse_mode: 'Markdown' }
    );
  }
});

// Iniciar
bot.launch()
  .then(() => console.log('✅ Bot iniciado!'))
  .catch((err) => console.error('❌ Erro:', err));
```

### Passo 3: Executar

```bash
npx ts-node meu-bot.ts
```

## 🎯 Adicionar Botões

```typescript
import { Markup } from 'telegraf';

bot.registerCommand({
  command: 'menu',
  handler: async (ctx) => {
    await ctx.reply(
      'Escolha uma opção:',
      Markup.inlineKeyboard([
        [Markup.button.callback('Opção 1', 'opt1')],
        [Markup.button.callback('Opção 2', 'opt2')]
      ])
    );
  }
});

// Handler dos botões
bot.registerAction({
  action: 'opt1',
  handler: async (ctx) => {
    await ctx.reply('Você escolheu a Opção 1!');
  }
});

bot.registerAction({
  action: 'opt2',
  handler: async (ctx) => {
    await ctx.reply('Você escolheu a Opção 2!');
  }
});
```

## 💾 Usar Sessões

```typescript
bot.registerCommand({
  command: 'counter',
  handler: async (ctx) => {
    if (!ctx.session) return;
    
    // Incrementar contador
    ctx.session.data.count = (ctx.session.data.count || 0) + 1;
    
    await ctx.reply(`Você executou este comando ${ctx.session.data.count} vez(es)!`);
  }
});
```

## 🎯 Registrar Eventos

Registre handlers para qualquer evento do Telegraf de forma simples:

```typescript
// Fotos
bot.registerEvent({
  event: 'photo',
  description: 'Processar fotos enviadas',
  handler: async (ctx) => {
    await ctx.reply('📸 Foto recebida! Obrigado por compartilhar.');
  }
});

// Stickers
bot.registerEvent({
  event: 'sticker',
  handler: async (ctx) => {
    await ctx.reply('😄 Sticker legal!');
  }
});

// Novos membros
bot.registerEvent({
  event: 'new_chat_members',
  handler: async (ctx) => {
    const newMembers = (ctx.message as any)?.new_chat_members ?? [];
    for (const member of newMembers) {
      await ctx.reply(`👋 Bem-vindo, ${member.first_name}!`);
    }
  }
});

// Todos os 70+ eventos do Telegraf são suportados!
// O TypeScript autocompleta todos os eventos quando você digita 'event:'
```

## 🔌 Adicionar Plugin

```typescript
import { MenuPlugin, MenuBuilder } from './src/plugins/menu/MenuPlugin';

const menuPlugin = new MenuPlugin();
bot.addPlugin(menuPlugin);

// Criar menu
const menu = MenuBuilder.createMenuBuilder('principal')
  .setText('📱 *Menu Principal*')
  .setLayout('grid', 2)
  .addItem('🏠 Início', 'inicio')
  .addItem('ℹ️ Sobre', 'sobre')
  .addItem('📞 Contato', 'contato')
  .addItem('⚙️ Configurações', 'config')
  .build();

menuPlugin.registerMenu(menu);

// Mostrar menu
bot.registerCommand({
  command: 'menu',
  handler: async (ctx) => {
    await menuPlugin.renderMenu(ctx, 'principal');
  }
});
```

## 💳 Adicionar Pagamento PIX

```typescript
import { PaymentPlugin } from './src/plugins/payment/PaymentPlugin';

const paymentPlugin = new PaymentPlugin({
  method: 'pix',
  pix: {
    key: 'sua-chave@pix.com',
    merchantName: 'Seu Nome',
    merchantCity: 'Sua Cidade'
  }
});

bot.addPlugin(paymentPlugin);

bot.registerCommand({
  command: 'pagar',
  handler: async (ctx) => {
    const payment = await paymentPlugin.generatePaymentCode({
      amount: 10.00,
      description: 'Pagamento de R$ 10,00'
    });
    
    await ctx.reply(`💰 Código PIX:\n\`${payment.code}\``, {
      parse_mode: 'Markdown'
    });
    
    await ctx.replyWithPhoto({ source: payment.qrCode! }, {
      caption: '📱 Escaneie o QR Code para pagar'
    });
  }
});
```

## 🛡️ Adicionar Proteção (Rate Limit)

```typescript
import { RateLimitMiddleware } from './src/framework';

const bot = new BotEngine({
  token: TOKEN,
  middleware: [
    new RateLimitMiddleware(10, 60000) // 10 requisições por minuto
  ]
});
```

## 🎨 Usar MessageBuilder

```typescript
import { MessageBuilder } from './src/framework';

bot.registerCommand({
  command: 'info',
  handler: async (ctx) => {
    const message = MessageBuilder.create()
      .setText('*Informações do Bot*\n\nEscolha uma opção:')
      .setParseMode('Markdown')
      .addButton('📊 Estatísticas', 'stats')
      .addButton('👥 Usuários', 'users')
      .addButtonRow()
      .addUrlButton('🌐 Site', 'https://example.com')
      .build();
    
    await ctx.reply(message.text, message.markup);
  }
});
```

## 📝 Templates Prontos

### Bot Simples
```bash
npm run example
# Veja: src/examples/simple-bot.ts
```

### Bot Completo (PIX)
```bash
npm run dev
# Veja: src/app/bot.ts
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Executa com ts-node
npm run watch        # Compila em modo watch

# Produção
npm run build        # Compila TypeScript
npm start            # Executa compilado

# Exemplos
npm run example      # Bot simples
npm run legacy       # Bot legado (JS)

# Limpeza
npm run clean        # Remove dist/
```

## 📚 Próximos Passos

1. ✅ [README.md](README.md) - Visão geral completa
2. ✅ [FRAMEWORK.md](FRAMEWORK.md) - Documentação detalhada
3. ✅ [MIGRACAO.md](MIGRACAO.md) - Migrar bot existente
4. ✅ [RESUMO-FRAMEWORK.md](RESUMO-FRAMEWORK.md) - O que foi criado

## 💡 Dicas

- Use TypeScript para evitar erros
- Separe configurações em arquivos
- Crie plugins para funcionalidades reutilizáveis
- Use middleware para validações
- Aproveite as sessões para guardar estado
- Teste localmente antes de fazer deploy

## ❓ Problemas Comuns

### Bot não responde
```bash
# Verifique o token
echo $TELEGRAM_BOT_TOKEN

# Teste a conexão
npm run dev
```

### Erro de compilação
```bash
# Limpe e recompile
npm run clean
npm run build
```

### Dependências faltando
```bash
npm install
```

## 🎯 Exemplo Mínimo (Copiar e Colar)

```typescript
import { BotEngine } from './src/framework';

const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  name: 'Bot Teste'
});

bot.registerCommand({
  command: 'start',
  handler: async (ctx) => {
    await ctx.reply('Olá! 👋');
  }
});

bot.launch();
```

Salve como `teste.ts` e execute:
```bash
npx ts-node teste.ts
```

---

**Pronto! Seu bot está funcionando! 🎉**

