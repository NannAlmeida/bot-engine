/**
 * Advanced Bot Example
 * Demonstrates advanced features: plugins, middleware, menus
 * 
 * @author Paulo Renan <rennandeveloper@gmail.com>
 */

import { 
  BotEngine, 
  LoggingMiddleware, 
  RateLimitMiddleware,
  MenuPlugin,
  MenuBuilder,
  HelpPlugin
} from '../src';
import { Markup } from 'telegraf';
import * as dotenv from 'dotenv';

dotenv.config();

// Create bot with middleware
const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  name: 'Advanced Bot',
  middleware: [
    new LoggingMiddleware(),
    new RateLimitMiddleware(10, 60000) // 10 requests per minute
  ],
  session: {
    enabled: true,
    ttl: 3600
  }
});

// Setup Menu Plugin
const menuPlugin = new MenuPlugin();
bot.addPlugin(menuPlugin);

// Create main menu
const mainMenu = MenuBuilder.createMenuBuilder('main')
  .setTitle('Main Menu')
  .setText('📱 *Main Menu*\n\nChoose an option:')
  .setLayout('grid', 2)
  .addItem('✅ Option 1', 'opt1')
  .addItem('✅ Option 2', 'opt2')
  .addItem('ℹ️ Help', 'help')
  .addItem('⚙️ Settings', 'settings')
  .build();

menuPlugin.registerMenu(mainMenu);

// Setup Help Plugin
const helpPlugin = new HelpPlugin({
  topics: [
    {
      id: 'getting-started',
      title: '🚀 Getting Started',
      content: '*Getting Started*\n\nUse /start to begin and /menu to see available options.',
      category: 'Basic'
    },
    {
      id: 'commands',
      title: '📝 Commands',
      content: '*Available Commands:*\n\n/start - Start the bot\n/menu - Show menu\n/help - Show help',
      category: 'Basic'
    },
    {
      id: 'features',
      title: '✨ Features',
      content: '*Framework Features:*\n\n• Plugin system\n• Middleware support\n• Session management\n• Type-safe TypeScript',
      category: 'Advanced'
    }
  ]
});

bot.addPlugin(helpPlugin);

// Register commands
bot.registerCommand({
  command: 'start',
  description: 'Start the bot',
  handler: async (ctx) => {
    const firstName = ctx.from?.first_name || 'there';
    await ctx.reply(
      `👋 Hello, ${firstName}!\n\n` +
      '🤖 Welcome to the Advanced Bot Example\n\n' +
      'This bot demonstrates:\n' +
      '• 🔌 Plugin system\n' +
      '• 🛡️ Middleware\n' +
      '• 📱 Interactive menus\n' +
      '• ℹ️ Help system\n\n' +
      'Use /menu to get started!',
      Markup.inlineKeyboard([
        [Markup.button.callback('📱 Open Menu', 'menu:main')],
        [Markup.button.callback('ℹ️ Help', 'help')]
      ])
    );
  }
});

bot.registerCommand({
  command: 'menu',
  description: 'Show menu',
  handler: async (ctx) => {
    await menuPlugin.renderMenu(ctx, 'main');
  }
});

// Register menu actions
bot.registerAction({
  action: 'menu:main',
  handler: async (ctx) => {
    await menuPlugin.editMenu(ctx, 'main');
  }
});

bot.registerAction({
  action: 'opt1',
  handler: async (ctx) => {
    await ctx.reply('✅ You selected Option 1!');
  }
});

bot.registerAction({
  action: 'opt2',
  handler: async (ctx) => {
    await ctx.reply('✅ You selected Option 2!');
  }
});

bot.registerAction({
  action: 'settings',
  handler: async (ctx) => {
    await ctx.reply(
      '⚙️ *Settings*\n\nSettings functionality would go here.',
      { 
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('« Back to Menu', 'menu:main')]
        ])
      }
    );
  }
});

// Launch bot
bot.launch()
  .then(() => {
    console.log('✅ Advanced bot started successfully!');
    console.log('📝 Features enabled:');
    console.log('  - Logging middleware');
    console.log('  - Rate limiting (10 req/min)');
    console.log('  - Menu plugin');
    console.log('  - Help plugin');
    console.log('  - Session management');
    console.log('\nPress Ctrl+C to stop');
  })
  .catch((error) => {
    console.error('❌ Error starting bot:', error);
    process.exit(1);
  });

