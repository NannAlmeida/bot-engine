/**
 * Template com Express para projetos
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export async function createExpressTemplate(projectPath: string, projectName: string): Promise<void> {
  // Criar estrutura de diretórios
  const srcDir = path.join(projectPath, 'src');
  const routesDir = path.join(srcDir, 'routes');
  fs.ensureDirSync(srcDir);
  fs.ensureDirSync(routesDir);

  // package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: 'Bot Telegram com Express criado com Bot Engine',
    main: 'dist/index.js',
    scripts: {
      'dev': 'ts-node src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
      'watch': 'tsc --watch'
    },
    keywords: ['telegram', 'bot', 'bot-engine', 'express', 'webhook'],
    author: '',
    license: 'MIT',
    dependencies: {
      'bot-engine-telegram': '^1.1.0',
      'telegraf': '^4.15.0',
      'express': '^4.18.2',
      'dotenv': '^16.3.1'
    },
    devDependencies: {
      '@types/express': '^4.17.21',
      '@types/node': '^20.19.25',
      'ts-node': '^10.9.2',
      'typescript': '^5.9.3'
    }
  };

  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  fs.writeFileSync(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );

  // .env.example
  const envExample = `# Token do Bot Telegram
# Obtenha em: https://t.me/BotFather
BOT_TOKEN=your_bot_token_here

# Nome do bot (opcional)
BOT_NAME=Meu Bot Telegram

# Configurações do servidor HTTP
PORT=3000
HOST=localhost

# Webhook (opcional - deixe vazio para usar polling)
# WEBHOOK_URL=https://seu-dominio.com/webhook
# WEBHOOK_SECRET=seu_secret_aqui
`;

  fs.writeFileSync(path.join(projectPath, '.env.example'), envExample);
  fs.writeFileSync(path.join(projectPath, '.env'), envExample);

  // .gitignore
  const gitignore = `# Dependencies
node_modules/

# Build
dist/

# Environment
.env

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
`;

  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

  // README.md
  const readme = `# ${projectName}

Bot Telegram com servidor HTTP integrado, criado com [Bot Engine](https://github.com/NannAlmeida/bot-engine)

## 🚀 Como usar

### 1. Configure o token do bot

Edite o arquivo \`.env\` e adicione o token do seu bot:

\`\`\`env
BOT_TOKEN=seu_token_aqui
BOT_NAME=Nome do seu bot
PORT=3000
\`\`\`

### 2. Instale as dependências

\`\`\`bash
npm install
\`\`\`

### 3. Execute o bot

\`\`\`bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm run build
npm start
\`\`\`

## 📡 Endpoints HTTP

O servidor HTTP estará disponível em \`http://localhost:3000\`

### Rotas disponíveis:

- \`GET /\` - Página inicial
- \`GET /status\` - Status do bot
- \`GET /health\` - Health check
- \`POST /webhook\` - Webhook para integrações externas
- \`POST /webhook/telegram\` - Webhook do Telegram (quando configurado)

## 📝 Comandos do Bot

- \`/start\` - Inicia a conversa com o bot
- \`/help\` - Mostra a lista de comandos
- \`/info\` - Mostra informações sobre o bot

## 🔧 Integrações

### Webhook para integrações externas

Você pode enviar dados para o bot através do endpoint \`/webhook\`:

\`\`\`bash
curl -X POST http://localhost:3000/webhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatId": "123456789",
    "message": "Olá do webhook!"
  }'
\`\`\`

### Webhook do Telegram

Para usar webhook do Telegram ao invés de polling, configure no \`.env\`:

\`\`\`env
WEBHOOK_URL=https://seu-dominio.com/webhook/telegram
WEBHOOK_SECRET=seu_secret_aleatorio
\`\`\`

## 🛠️ Desenvolvimento

### Estrutura do projeto

\`\`\`
${projectName}/
├── src/
│   ├── routes/
│   │   ├── index.ts      # Rota principal
│   │   ├── status.ts     # Rota de status
│   │   └── webhook.ts    # Rota de webhook
│   ├── bot.ts            # Configuração do bot
│   ├── server.ts         # Configuração do Express
│   └── index.ts          # Arquivo principal
├── .env                  # Configurações
├── .env.example          # Exemplo de configurações
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

### Adicionando novas rotas

Crie um novo arquivo em \`src/routes/\`:

\`\`\`typescript
import { Router } from 'express';

const router = Router();

router.get('/minha-rota', (req, res) => {
  res.json({ message: 'Minha rota!' });
});

export default router;
\`\`\`

E importe em \`src/server.ts\`.

## 📚 Documentação

- [Bot Engine](https://github.com/NannAlmeida/bot-engine)
- [Telegraf](https://telegraf.js.org/)
- [Express](https://expressjs.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 📄 Licença

MIT
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

  // src/bot.ts
  const botTs = `/**
 * Configuração do Bot Telegram
 */

import { BotEngine } from 'bot-engine-telegram';

export function createBot(token: string, name: string): BotEngine {
  const bot = new BotEngine({
    token,
    name
  });

  // Log de inicialização
  bot.getLogger().info('🤖 Configurando comandos do bot...');

  // Comando /start
  bot.registerCommand({
    command: 'start',
    description: 'Inicia a conversa com o bot',
    handler: async (ctx) => {
      const userName = ctx.from?.first_name || 'Usuário';
      
      bot.getLogger().info(\`Comando /start recebido de: \${userName} (ID: \${ctx.from?.id})\`);
      
      await ctx.reply(
        \`👋 Olá, \${userName}! Bem-vindo ao \${name}!\\n\\n\` +
        \`Este bot possui integração com servidor HTTP.\\n\` +
        \`Use /help para ver os comandos disponíveis.\`
      );
    }
  });

  // Comando /help
  bot.registerCommand({
    command: 'help',
    description: 'Mostra a lista de comandos',
    handler: async (ctx) => {
      bot.getLogger().info(\`Comando /help recebido de: \${ctx.from?.first_name} (ID: \${ctx.from?.id})\`);
      
      await ctx.reply(
        \`📚 *Comandos disponíveis:*\\n\\n\` +
        \`/start - Inicia a conversa\\n\` +
        \`/help - Mostra esta mensagem\\n\` +
        \`/info - Informações sobre o bot\`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  // Comando /info
  bot.registerCommand({
    command: 'info',
    description: 'Mostra informações sobre o bot',
    handler: async (ctx) => {
      bot.getLogger().info(\`Comando /info recebido de: \${ctx.from?.first_name} (ID: \${ctx.from?.id})\`);
      
      const botInfo = bot.getBotInfo();
      
      await ctx.reply(
        \`ℹ️ *Informações do Bot*\\n\\n\` +
        \`Nome: \${botInfo?.first_name || 'N/A'}\\n\` +
        \`Username: @\${botInfo?.username || 'N/A'}\\n\` +
        \`ID: \${botInfo?.id || 'N/A'}\\n\\n\` +
        \`🔧 Criado com Bot Engine + Express\`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  // Handler para mensagens de texto não reconhecidas
  bot.registerEvent({
    event: 'text',
    description: 'Handler para mensagens de texto',
    handler: async (ctx) => {
      const message = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
      
      // Ignorar se for um comando
      if (message.startsWith('/')) {
        return;
      }
      
      bot.getLogger().info(\`Mensagem recebida: "\${message}" de \${ctx.from?.first_name}\`);
      
      await ctx.reply(
        \`Você disse: "\${message}"\\n\\n\` +
        \`Use /help para ver os comandos disponíveis.\`
      );
    }
  });

  return bot;
}
`;

  fs.writeFileSync(path.join(srcDir, 'bot.ts'), botTs);

  // src/server.ts
  const serverTs = `/**
 * Configuração do servidor Express
 */

import express, { Application } from 'express';
import { BotEngine } from 'bot-engine-telegram';
import indexRouter from './routes/index';
import statusRouter from './routes/status';
import webhookRouter from './routes/webhook';

export function createServer(bot: BotEngine): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logger middleware
  app.use((req, res, next) => {
    bot.getLogger().info(\`\${req.method} \${req.path}\`);
    next();
  });

  // Rotas
  app.use('/', indexRouter);
  app.use('/status', statusRouter(bot));
  app.use('/webhook', webhookRouter(bot));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Endpoint não encontrado',
      path: req.path
    });
  });

  // Error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    bot.getLogger().error('Erro no servidor:', err);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: err.message
    });
  });

  return app;
}
`;

  fs.writeFileSync(path.join(srcDir, 'server.ts'), serverTs);

  // src/routes/index.ts
  const indexRouterTs = `/**
 * Rota principal
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    name: '${projectName}',
    description: 'Bot Telegram com servidor HTTP',
    version: '1.0.0',
    endpoints: {
      status: '/status',
      health: '/health',
      webhook: '/webhook'
    }
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;
`;

  fs.writeFileSync(path.join(routesDir, 'index.ts'), indexRouterTs);

  // src/routes/status.ts
  const statusRouterTs = `/**
 * Rota de status do bot
 */

import { Router } from 'express';
import { BotEngine } from 'bot-engine-telegram';

export default function createStatusRouter(bot: BotEngine): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const botInfo = bot.getBotInfo();
      
      res.json({
        status: 'online',
        bot: {
          id: botInfo?.id,
          username: botInfo?.username,
          firstName: botInfo?.first_name
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: 'Erro ao obter status do bot'
      });
    }
  });

  return router;
}
`;

  fs.writeFileSync(path.join(routesDir, 'status.ts'), statusRouterTs);

  // src/routes/webhook.ts
  const webhookRouterTs = `/**
 * Rota de webhook para integrações
 */

import { Router } from 'express';
import { BotEngine } from 'bot-engine-telegram';

export default function createWebhookRouter(bot: BotEngine): Router {
  const router = Router();

  // Webhook para integrações externas
  router.post('/', async (req, res) => {
    try {
      const { chatId, message } = req.body;

      if (!chatId || !message) {
        return res.status(400).json({
          error: 'Parâmetros inválidos',
          required: ['chatId', 'message']
        });
      }

      bot.getLogger().info(\`Webhook recebido - Chat: \${chatId}, Mensagem: \${message}\`);

      // Enviar mensagem via bot
      const telegram = bot.getTelegrafInstance().telegram;
      await telegram.sendMessage(chatId, message);

      res.json({
        success: true,
        message: 'Mensagem enviada com sucesso'
      });
    } catch (error) {
      bot.getLogger().error('Erro no webhook:', error as Error);
      
      res.status(500).json({
        success: false,
        error: 'Erro ao processar webhook'
      });
    }
  });

  // Webhook do Telegram (quando configurado)
  router.post('/telegram', (req, res) => {
    bot.getLogger().info('Webhook do Telegram recebido');
    
    // O Telegraf processa automaticamente quando configurado com webhook
    res.sendStatus(200);
  });

  return router;
}
`;

  fs.writeFileSync(path.join(routesDir, 'webhook.ts'), webhookRouterTs);

  // src/index.ts
  const indexTs = `/**
 * ${projectName}
 * Bot Telegram com servidor HTTP
 */

import 'dotenv/config';
import { createBot } from './bot';
import { createServer } from './server';

// Validar configurações
if (!process.env.BOT_TOKEN) {
  console.error('❌ Erro: BOT_TOKEN não configurado no arquivo .env');
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || 'localhost';
const BOT_NAME = process.env.BOT_NAME || '${projectName}';

// Criar bot
const bot = createBot(process.env.BOT_TOKEN, BOT_NAME);

// Criar servidor
const app = createServer(bot);

// Iniciar servidor
const server = app.listen(PORT, HOST, () => {
  bot.getLogger().info(\`🌐 Servidor HTTP iniciado em http://\${HOST}:\${PORT}\`);
});

// Iniciar bot
bot.launch()
  .then(() => {
    bot.getLogger().info('✅ Bot iniciado com sucesso!');
    bot.getLogger().info(\`📱 Nome: \${BOT_NAME}\`);
    bot.getLogger().info('🚀 Sistema pronto para uso!');
  })
  .catch((error) => {
    bot.getLogger().error('❌ Erro ao iniciar bot:', error);
    server.close();
    process.exit(1);
  });

// Graceful shutdown
const shutdown = (signal: string) => {
  bot.getLogger().info(\`🛑 Recebido sinal \${signal}, encerrando...\`);
  
  server.close(() => {
    bot.getLogger().info('🌐 Servidor HTTP encerrado');
    bot.stop(signal);
    process.exit(0);
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    bot.getLogger().error('⚠️  Forçando encerramento...');
    process.exit(1);
  }, 10000);
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
`;

  fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs);
}

