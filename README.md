# Telegraf Bot Framework

<div align="center">

A modern, modular TypeScript framework for building Telegram bots with [Telegraf](https://telegraf.js.org/)

[![npm version](https://img.shields.io/npm/v/@paulorenan/telegraf-bot-framework.svg)](https://www.npmjs.com/package/@paulorenan/telegraf-bot-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-4.15-green)](https://telegraf.js.org/)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Examples](#-examples)

</div>

## ✨ Features

- 🏗️ **Modular Architecture** - Plugin-based system for reusable functionality
- 🔌 **Plugin System** - Create and share custom plugins
- 🛡️ **Middleware Support** - Built-in middleware for logging, auth, rate limiting
- 💾 **Session Management** - Integrated session storage with TTL
- 🎯 **Type-Safe** - Full TypeScript support with comprehensive type definitions
- 🎨 **Builder Pattern** - Fluent API for building messages and menus
- 📝 **Well Documented** - Extensive documentation and examples
- ✅ **Tested** - Comprehensive unit test coverage
- 🚀 **Production Ready** - Battle-tested and actively maintained

## 📦 Installation

```bash
npm install @paulorenan/telegraf-bot-framework telegraf
```

or with yarn:

```bash
yarn add @paulorenan/telegraf-bot-framework telegraf
```

## 🚀 Quick Start

### Basic Bot

```typescript
import { BotEngine } from '@paulorenan/telegraf-bot-framework';

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
import { BotEngine, LoggingMiddleware, RateLimitMiddleware } from '@paulorenan/telegraf-bot-framework';

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
import { BotEngine, MenuPlugin, HelpPlugin } from '@paulorenan/telegraf-bot-framework';

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
import { MenuPlugin, MenuBuilder } from '@paulorenan/telegraf-bot-framework';

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
import { HelpPlugin } from '@paulorenan/telegraf-bot-framework';

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
import { LoggingMiddleware } from '@paulorenan/telegraf-bot-framework';

bot.use(new LoggingMiddleware());
```

### RateLimitMiddleware

Protect your bot from spam:

```typescript
import { RateLimitMiddleware } from '@paulorenan/telegraf-bot-framework';

bot.use(new RateLimitMiddleware(10, 60000)); // 10 req/min
```

### AuthMiddleware

Restrict access to specific users:

```typescript
import { AuthMiddleware } from '@paulorenan/telegraf-bot-framework';

bot.use(new AuthMiddleware([123456, 789012])); // User IDs
```

## 🎨 Message Builder

Fluent API for building complex messages:

```typescript
import { MessageBuilder } from '@paulorenan/telegraf-bot-framework';

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

- [Framework Documentation](docs/framework.md) - Complete framework reference
- [Quick Start Guide](docs/quick-start.md) - Get started in 5 minutes
- [Migration Guide](docs/migration.md) - Migrate from plain Telegraf
- [API Reference](docs/summary.md) - Detailed API documentation

## 💻 Examples

Check out the [examples](examples/) directory for more:

- [basic-bot.ts](examples/basic-bot.ts) - Simple bot with commands
- [advanced-bot.ts](examples/advanced-bot.ts) - Bot with plugins and middleware

Run examples:

```bash
# Clone the repository
git clone https://github.com/paulorenan/telegraf-bot-framework.git
cd telegraf-bot-framework

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
import { Plugin } from '@paulorenan/telegraf-bot-framework';

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
- GitHub: [@paulorenan](https://github.com/paulorenan)

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
