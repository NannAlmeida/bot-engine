/**
 * Template básico para projetos
 */

import * as fs from 'fs-extra';
import * as path from 'path';

export async function createBasicTemplate(projectPath: string, projectName: string): Promise<void> {
  // Criar estrutura de diretórios
  const srcDir = path.join(projectPath, 'src');
  fs.ensureDirSync(srcDir);

  // package.json
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: 'Bot Telegram criado com Bot Engine',
    main: 'dist/index.js',
    scripts: {
      'dev': 'ts-node src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
      'watch': 'tsc --watch'
    },
    keywords: ['telegram', 'bot', 'bot-engine'],
    author: '',
    license: 'MIT',
    dependencies: {
      'bot-engine-telegram': '^1.1.0',
      'telegraf': '^4.15.0',
      'dotenv': '^16.3.1'
    },
    devDependencies: {
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
`;

  fs.writeFileSync(path.join(projectPath, '.env.example'), envExample);

  // .env
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

Bot Telegram criado com [Bot Engine](https://github.com/NannAlmeida/bot-engine)

## 🚀 Como usar

### 1. Configure o token do bot

Edite o arquivo \`.env\` e adicione o token do seu bot:

\`\`\`env
BOT_TOKEN=seu_token_aqui
BOT_NAME=Nome do seu bot
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

## 📝 Comandos disponíveis

- \`/start\` - Inicia a conversa com o bot
- \`/help\` - Mostra a lista de comandos
- \`/info\` - Mostra informações sobre o bot

## 🛠️ Desenvolvimento

Este bot foi criado usando o Bot Engine, um framework modular para criar bots Telegram com TypeScript.

### Estrutura do projeto

\`\`\`
${projectName}/
├── src/
│   └── index.ts       # Arquivo principal do bot
├── .env               # Configurações (não commitar!)
├── .env.example       # Exemplo de configurações
├── package.json
├── tsconfig.json
└── README.md
\`\`\`

## 📚 Documentação

- [Bot Engine](https://github.com/NannAlmeida/bot-engine)
- [Telegraf](https://telegraf.js.org/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 📄 Licença

MIT
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);

  // src/index.ts
  const indexTs = `/**
 * ${projectName}
 * Bot Telegram criado com Bot Engine
 */

import 'dotenv/config';
import { BotEngine } from 'bot-engine-telegram';

// Validar token
if (!process.env.BOT_TOKEN) {
  console.error('❌ Erro: BOT_TOKEN não configurado no arquivo .env');
  process.exit(1);
}

// Configurar bot
const bot = new BotEngine({
  token: process.env.BOT_TOKEN,
  name: process.env.BOT_NAME || '${projectName}'
});

// Log de inicialização
bot.getLogger().info('🚀 Inicializando bot...');

// Comando /start
bot.registerCommand({
  command: 'start',
  description: 'Inicia a conversa com o bot',
  handler: async (ctx) => {
    const userName = ctx.from?.first_name || 'Usuário';
    
    bot.getLogger().info(\`Comando /start recebido de: \${userName} (ID: \${ctx.from?.id})\`);
    
    await ctx.reply(
      \`👋 Olá, \${userName}! Bem-vindo ao \${process.env.BOT_NAME || 'Bot'}!\\n\\n\` +
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
      \`🔧 Criado com Bot Engine\`,
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

// Iniciar bot
bot.launch()
  .then(() => {
    bot.getLogger().info('✅ Bot iniciado com sucesso!');
    bot.getLogger().info(\`📱 Nome: \${process.env.BOT_NAME || '${projectName}'}\`);
  })
  .catch((error) => {
    bot.getLogger().error('❌ Erro ao iniciar bot:', error);
    process.exit(1);
  });

// Graceful shutdown
process.once('SIGINT', () => {
  bot.getLogger().info('🛑 Recebido sinal SIGINT, parando bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  bot.getLogger().info('🛑 Recebido sinal SIGTERM, parando bot...');
  bot.stop('SIGTERM');
});
`;

  fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs);
}

