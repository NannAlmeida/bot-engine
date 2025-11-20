/**
 * Basic Bot Example
 * Demonstrates the basic usage of the framework
 * 
 * @author Paulo Renan <rennandeveloper@gmail.com>
 */

import { BotEngine, LoggingMiddleware } from '../src';
import * as dotenv from 'dotenv';

dotenv.config();

// Create bot instance
const bot = new BotEngine({
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  name: 'Basic Bot',
  middleware: [new LoggingMiddleware()],
  session: {
    enabled: true,
    ttl: 3600 // 1 hour
  }
});

// Register /start command
bot.registerCommand({
  command: 'start',
  description: 'Start the bot',
  handler: async (ctx) => {
    const firstName = ctx.from?.first_name || 'there';
    await ctx.reply(
      `👋 Hello, ${firstName}!\n\n` +
      'Welcome to the Telegraf Bot Framework example.\n\n' +
      'Try these commands:\n' +
      '/help - Show available commands\n' +
      '/counter - Test session storage\n' +
      '/echo <text> - Echo your message'
    );
  }
});

// Register /help command
bot.registerCommand({
  command: 'help',
  description: 'Show help information',
  handler: async (ctx) => {
    await ctx.reply(
      '*Available Commands:*\n\n' +
      '/start - Start the bot\n' +
      '/help - Show this help\n' +
      '/counter - Increment counter (session demo)\n' +
      '/echo <text> - Echo your message\n' +
      '/ping - Test bot response',
      { parse_mode: 'Markdown' }
    );
  }
});

// Register /counter command (demonstrates session usage)
bot.registerCommand({
  command: 'counter',
  description: 'Increment counter',
  handler: async (ctx) => {
    if (!ctx.session) {
      await ctx.reply('Session not available');
      return;
    }
    
    ctx.session.data.count = (ctx.session.data.count || 0) + 1;
    await ctx.reply(
      `📊 Counter: ${ctx.session.data.count}\n\n` +
      'This demonstrates session storage. Your count is saved for 1 hour.'
    );
  }
});

// Register /echo command
bot.registerCommand({
  command: 'echo',
  description: 'Echo a message',
  handler: async (ctx) => {
    const text = ctx.message && 'text' in ctx.message 
      ? ctx.message.text.replace('/echo', '').trim()
      : '';
    
    if (!text) {
      await ctx.reply('Usage: /echo <your message>');
      return;
    }
    
    await ctx.reply(`🔊 Echo: ${text}`);
  }
});

// Register /ping command
bot.registerCommand({
  command: 'ping',
  description: 'Test bot response',
  handler: async (ctx) => {
    const start = Date.now();
    await ctx.reply('🏓 Pong!');
    const duration = Date.now() - start;
    await ctx.reply(`⏱️ Response time: ${duration}ms`);
  }
});

// Launch the bot
bot.launch()
  .then(() => {
    console.log('✅ Bot started successfully!');
    console.log('Press Ctrl+C to stop');
  })
  .catch((error) => {
    console.error('❌ Error starting bot:', error);
    process.exit(1);
  });

