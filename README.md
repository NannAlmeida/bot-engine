# Telegraf Bot Framework

<div align="center">

A modern, modular TypeScript framework for building Telegram bots with [Telegraf](https://telegraf.js.org/)

[![npm version](https://img.shields.io/npm/v/bot-engine-telegram.svg)](https://www.npmjs.com/package/bot-engine-telegram)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-4.15-green)](https://telegraf.js.org/)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

## ✨ Features

- 🏗️ **Modular Architecture** - Plugin-based system for reusable functionality
- 🔌 **Plugin System** - Create and share custom plugins
- 🛡️ **Middleware Support** - Built-in middleware for logging, auth, rate limiting
- 📡 **Event System** - Register handlers for all 70+ Telegraf events with full type safety
- 🌐 **HTTP Integration** - Built-in Express server for webhooks and REST APIs
- 🪝 **Webhook Support** - Easy integration with external systems
- 🛠️ **CLI Tool** - Create new projects with ready-to-use templates
- 💾 **Session Management** - Integrated session storage with TTL
- 🎯 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🎨 **Builder Pattern** - Fluent API for building messages and menus
- 📝 **Well Documented** - Extensive documentation and examples
- ✅ **Tested** - Comprehensive unit test coverage
- 🚀 **Production Ready** - Battle-tested and actively maintained

## 📦 Installation

```bash
npm install bot-engine-telegram telegraf
```

or with yarn:

```bash
yarn add bot-engine-telegram telegraf
```

## 🚀 Quick Start

### Using CLI (Recommended)

Create a new bot project instantly with our CLI:

```bash
# Using npx (no installation needed)
npx bot-engine-telegram init my-bot

# Or install globally
npm install -g bot-engine-telegram
create-bot-engine init my-bot
```

Choose between:
- **Basic Template**: Simple bot with essential commands
- **Express Template**: Bot with HTTP server for webhooks and APIs

[📖 See CLI Documentation](./docs/cli.md)

### Basic Bot

```typescript
import { BotEngine } from 'bot-engine-telegram';

const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  name: 'My Bot'
});

bot.registerCommand({
  command: 'start',
  description: 'Start the bot',
  handler: async (ctx) => {
    await ctx.reply('Hello! 👋');
  }
});

bot.launch();
```

### With Middleware

```typescript
import { BotEngine, LoggingMiddleware, RateLimitMiddleware } from 'bot-engine-telegram';

const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  middleware: [
    new LoggingMiddleware(),
    new RateLimitMiddleware(10, 60000) // 10 requests per minute
  ],
  session: {
    enabled: true,
    ttl: 3600 // 1 hour
  }
});
```

### With Plugins

```typescript
import { BotEngine, MenuPlugin, HelpPlugin } from 'bot-engine-telegram';

const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN!
});

// Add built-in plugins
bot.addPlugin(new MenuPlugin());
bot.addPlugin(new HelpPlugin({
  topics: [
    {
      id: 'start',
      title: 'Getting Started',
      content: 'Use /start to begin!'
    }
  ]
}));

bot.launch();
```

### With HTTP Server

Create a bot with integrated HTTP server for webhooks and REST APIs:

```typescript
import { BotEngine } from 'bot-engine-telegram';

const bot = new BotEngine({
  token: process.env.BOT_TOKEN!,
  name: 'My Bot',
  http: {
    enabled: true,
    port: 3000,
    cors: true
  }
});

// Bot commands
bot.registerCommand({
  command: 'start',
  handler: async (ctx) => {
    await ctx.reply('Bot with HTTP server! 🚀');
  }
});

// HTTP Routes
const httpServer = bot.getHttpServer();

if (httpServer) {
  // Webhook endpoint
  httpServer.post('/webhook/notification', async (req, res) => {
    const { chatId, message } = req.body;
    
    const telegram = bot.getTelegrafInstance().telegram;
    await telegram.sendMessage(chatId, message);
    
    res.json({ success: true });
  });
  
  // Custom API endpoint
  httpServer.get('/api/stats', (req, res) => {
    res.json({
      uptime: process.uptime(),
      status: 'online'
    });
  });
}

bot.launch();
```

[📖 See HTTP Integration Documentation](./docs/http-integration.md)

## 📚 Core Concepts

### Commands

Register bot commands with type-safe handlers:

```typescript
bot.registerCommand({
  command: 'help',
  description: 'Show help information',
  handler: async (ctx) => {
    await ctx.reply('Here is how to use the bot...');
  }
});
```

### Actions (Callback Queries)

Handle button clicks and inline keyboard interactions:

```typescript
bot.registerAction({
  action: 'button_click',
  handler: async (ctx) => {
    await ctx.reply('Button clicked!');
  }
});
```

### Messages

Handle text messages with pattern matching:

```typescript
bot.registerMessage({
  pattern: /hello/i,
  handler: async (ctx) => {
    await ctx.reply('Hello there!');
  }
});
```

### Events

Register handlers for any Telegraf event with full type safety:

```typescript
// Handle photo uploads
bot.registerEvent({
  event: 'photo',
  description: 'Handle photo messages',
  handler: async (ctx) => {
    await ctx.reply('📸 Photo received!');
  }
});

// Handle stickers
bot.registerEvent({
  event: 'sticker',
  handler: async (ctx) => {
    await ctx.reply('😄 Nice sticker!');
  }
});

// Handle new chat members
bot.registerEvent({
  event: 'new_chat_members',
  handler: async (ctx) => {
    const newMembers = (ctx.message as any)?.new_chat_members ?? [];
    for (const member of newMembers) {
      await ctx.reply(`👋 Welcome, ${member.first_name}!`);
    }
  }
});

// All 70+ Telegraf events are supported!
// TypeScript will autocomplete all available events
```

### Sessions

Store user-specific data across conversations:

```typescript
bot.registerCommand({
  command: 'counter',
  handler: async (ctx) => {
    ctx.session!.data.count = (ctx.session!.data.count || 0) + 1;
    await ctx.reply(`Count: ${ctx.session!.data.count}`);
  }
});
```

## 🔌 Built-in Plugins

### MenuPlugin

Create interactive menus with ease:

```typescript
import { MenuPlugin, MenuBuilder } from 'bot-engine-telegram';

const menuPlugin = new MenuPlugin();
bot.addPlugin(menuPlugin);

const menu = MenuBuilder.createMenuBuilder('main')
  .setText('📱 *Main Menu*\n\nChoose an option:')
  .setLayout('grid', 2)
  .addItem('✅ Option 1', 'opt1')
  .addItem('✅ Option 2', 'opt2')
  .build();

menuPlugin.registerMenu(menu);
```

### HelpPlugin

Organized help system with topics:

```typescript
import { HelpPlugin } from 'bot-engine-telegram';

const helpPlugin = new HelpPlugin({
  topics: [
    {
      id: 'getting-started',
      title: '🚀 Getting Started',
      content: 'Use /start to begin',
      category: 'Basic'
    }
  ]
});

bot.addPlugin(helpPlugin);
```

## 🛠️ Middleware

### LoggingMiddleware

Log all incoming updates:

```typescript
import { LoggingMiddleware } from 'bot-engine-telegram';

bot.use(new LoggingMiddleware());
```

### RateLimitMiddleware

Protect your bot from spam:

```typescript
import { RateLimitMiddleware } from 'bot-engine-telegram';

bot.use(new RateLimitMiddleware(10, 60000)); // 10 req/min
```

### AuthMiddleware

Restrict access to specific users:

```typescript
import { AuthMiddleware } from 'bot-engine-telegram';

bot.use(new AuthMiddleware([123456, 789012])); // User IDs
```

## 🎨 Message Builder

Fluent API for building complex messages:

```typescript
import { MessageBuilder } from 'bot-engine-telegram';

const message = MessageBuilder.create()
  .setText('*Choose an option:*')
  .setParseMode('Markdown')
  .addButton('Option 1', 'opt1')
  .addButton('Option 2', 'opt2')
  .addButtonRow()
  .addUrlButton('Website', 'https://example.com')
  .build();

await ctx.reply(message.text, message.markup);
```

## 📖 Documentation

- [CLI Tool](docs/cli.md) - Create projects with templates
- [HTTP Integration](docs/http-integration.md) - Webhooks and REST APIs
- [Framework Documentation](docs/framework.md) - Complete framework reference
- [Quick Start Guide](docs/quick-start.md) - Get started in 5 minutes
- [Migration Guide](docs/migration.md) - Migrate from plain Telegraf
- [API Reference](docs/summary.md) - Detailed API documentation

## 💻 Examples

Check out the [examples](examples/) directory for more:

- [basic-bot.ts](examples/basic-bot.ts) - Simple bot with commands
- [advanced-bot.ts](examples/advanced-bot.ts) - Bot with plugins and middleware
- [http-bot.ts](examples/http-bot.ts) - Bot with HTTP server and webhooks
- [webhook-integration.ts](examples/webhook-integration.ts) - External system integrations

Run examples:

```bash
# Clone the repository
git clone https://github.com/NannAlmeida/bot-engine.git
cd bot-engine

# Install dependencies
npm install

# Copy .env.example to .env and add your token
cp .env.example .env

# Run basic example
npm run dev
```

## 🧪 Testing

The framework includes comprehensive unit tests:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🏗️ Creating Custom Plugins

Create your own plugins to extend functionality:

```typescript
import { Plugin } from 'bot-engine-telegram';

export class MyPlugin extends Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  description = 'My custom plugin';

  async register() {
    this.engine.registerCommand({
      command: 'mycommand',
      handler: async (ctx) => {
        await ctx.reply('Hello from my plugin!');
      }
    });

    this.logger.info('Plugin registered successfully');
  }
}

// Use the plugin
bot.addPlugin(new MyPlugin());
```

## 🔧 Configuration

### Bot Configuration

```typescript
interface BotConfig {
  token: string;              // Bot token from @BotFather
  name?: string;              // Bot name
  description?: string;       // Bot description
  plugins?: IPlugin[];        // Plugins to load
  middleware?: IMiddleware[]; // Middleware to use
  session?: SessionConfig;    // Session configuration
  http?: HttpServerConfig;    // HTTP server configuration
}
```

### HTTP Server Configuration

```typescript
interface HttpServerConfig {
  enabled: boolean;       // Enable HTTP server
  port?: number;          // Server port (default: 3000)
  host?: string;          // Server host (default: 'localhost')
  cors?: boolean | {      // CORS configuration
    origin?: string | string[];
    credentials?: boolean;
  };
}
```

### Session Configuration

```typescript
interface SessionConfig {
  enabled: boolean;  // Enable session management
  ttl?: number;      // Session TTL in seconds
  storage?: string;  // Storage type (default: 'memory')
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Paulo Renan**

- Email: rennandeveloper@gmail.com
- GitHub: [@NannAlmeida](https://github.com/NannAlmeida)

## 🙏 Acknowledgments

- Built with [Telegraf](https://telegraf.js.org/)
- Inspired by modern web frameworks
- Thanks to all contributors

## 📊 Project Stats

- ✅ TypeScript 5.9+
- ✅ Telegraf 4.15+
- ✅ Node.js 16+
- ✅ Full test coverage
- ✅ Comprehensive documentation
- ✅ Production ready

---

<div align="center">

**Made with ❤️ by Paulo Renan**

[⬆ Back to Top](#telegraf-bot-framework)

</div>
