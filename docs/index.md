# Telegraf Bot Framework Documentation

Welcome to the Telegraf Bot Framework documentation!

## 📚 Table of Contents

### Getting Started
- [Quick Start Guide](quick-start.md) - Get started in 5 minutes
- [Installation](../README.md#-installation) - How to install the framework

### Core Documentation
- [Framework Overview](framework.md) - Complete framework documentation
- [API Reference](summary.md) - Detailed API documentation
- [Migration Guide](migration.md) - Migrate from plain Telegraf

### Guides
- **Creating Your First Bot** - Step-by-step tutorial
- **Plugin Development** - How to create custom plugins
- **Middleware** - Understanding and creating middleware
- **Session Management** - Working with sessions
- **Testing** - Testing your bots

### Examples
- [Basic Bot](../examples/basic-bot.ts) - Simple bot example
- [Advanced Bot](../examples/advanced-bot.ts) - Bot with plugins and middleware

## 🎯 Features

- 🏗️ Modular architecture
- 🔌 Plugin system
- 🛡️ Middleware support
- 💾 Session management
- 🎯 Type-safe TypeScript
- 📝 Well documented
- ✅ Tested

## 🚀 Quick Example

```typescript
import { BotEngine } from '@paulorenan/telegraf-bot-framework';

const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN!
});

bot.registerCommand({
  command: 'start',
  handler: async (ctx) => {
    await ctx.reply('Hello! 👋');
  }
});

bot.launch();
```

## 📖 Learn More

- [GitHub Repository](https://github.com/paulorenan/telegraf-bot-framework)
- [npm Package](https://www.npmjs.com/package/@paulorenan/telegraf-bot-framework)
- [Telegraf Documentation](https://telegraf.js.org/)

## 🤝 Contributing

Contributions are welcome! See our [Contributing Guide](../README.md#-contributing).

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details.

## 👤 Author

**Paulo Renan**
- Email: rennandeveloper@gmail.com
- GitHub: [@paulorenan](https://github.com/paulorenan)

---

**Made with ❤️ by Paulo Renan**

