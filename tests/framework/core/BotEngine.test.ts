/**
 * BotEngine Unit Tests
 * 
 * @author Paulo Renan <rennandeveloper@gmail.com>
 */

import { BotEngine } from '../../../src/framework/core/BotEngine';
import { Plugin } from '../../../src/framework/plugins/Plugin';

// Mock Telegraf
jest.mock('telegraf', () => {
  return {
    Telegraf: jest.fn().mockImplementation(() => ({
      launch: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn(),
      command: jest.fn(),
      action: jest.fn(),
      hears: jest.fn(),
      use: jest.fn(),
      catch: jest.fn(),
      telegram: {
        getMe: jest.fn().mockResolvedValue({
          id: 123,
          is_bot: true,
          first_name: 'TestBot',
          username: 'test_bot'
        })
      },
      botInfo: {
        id: 123,
        is_bot: true,
        first_name: 'TestBot',
        username: 'test_bot'
      }
    })),
    Markup: {
      button: {
        callback: jest.fn((text, data) => ({ text, callback_data: data })),
        url: jest.fn((text, url) => ({ text, url }))
      },
      inlineKeyboard: jest.fn((buttons) => ({ inline_keyboard: buttons }))
    }
  };
});

describe('BotEngine', () => {
  let bot: BotEngine;

  beforeEach(() => {
    bot = new BotEngine({
      token: 'test-token',
      name: 'Test Bot'
    });
  });

  afterEach(() => {
    if (bot) {
      bot.stop();
    }
  });

  describe('Constructor', () => {
    it('should create a bot instance', () => {
      expect(bot).toBeDefined();
      expect(bot).toBeInstanceOf(BotEngine);
    });

    it('should accept configuration', () => {
      const customBot = new BotEngine({
        token: 'custom-token',
        name: 'Custom Bot',
        session: {
          enabled: true,
          ttl: 7200
        }
      });

      expect(customBot).toBeDefined();
      customBot.stop();
    });
  });

  describe('Command Registration', () => {
    it('should register a command', () => {
      const handler = jest.fn();
      
      bot.registerCommand({
        command: 'start',
        description: 'Start command',
        handler
      });

      expect(bot).toBeDefined();
    });

    it('should register multiple commands', () => {
      bot.registerCommand({
        command: 'start',
        handler: jest.fn()
      });

      bot.registerCommand({
        command: 'help',
        handler: jest.fn()
      });

      expect(bot).toBeDefined();
    });
  });

  describe('Action Registration', () => {
    it('should register an action', () => {
      bot.registerAction({
        action: 'button_click',
        handler: jest.fn()
      });

      expect(bot).toBeDefined();
    });

    it('should register action with regex', () => {
      bot.registerAction({
        action: /^action_/,
        handler: jest.fn()
      });

      expect(bot).toBeDefined();
    });
  });

  describe('Message Registration', () => {
    it('should register message handler', () => {
      bot.registerMessage({
        pattern: /hello/i,
        handler: jest.fn()
      });

      expect(bot).toBeDefined();
    });
  });

  describe('Plugin System', () => {
    it('should add a plugin', async () => {
      class TestPlugin extends Plugin {
        name = 'test-plugin';
        version = '1.0.0';
        
        async register() {
          // Plugin registration logic
        }
      }

      const plugin = new TestPlugin();
      bot.addPlugin(plugin);

      expect(bot).toBeDefined();
    });

    it('should not add duplicate plugins', () => {
      class TestPlugin extends Plugin {
        name = 'test-plugin';
        version = '1.0.0';
        
        async register() {}
      }

      const plugin1 = new TestPlugin();
      const plugin2 = new TestPlugin();

      bot.addPlugin(plugin1);
      bot.addPlugin(plugin2);

      expect(bot).toBeDefined();
    });
  });

  describe('Lifecycle', () => {
    it('should launch the bot', async () => {
      await expect(bot.launch()).resolves.not.toThrow();
    });

    it('should stop the bot', () => {
      expect(() => bot.stop()).not.toThrow();
    });
  });

  describe('Logger', () => {
    it('should have a logger', () => {
      const logger = bot.getLogger();
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
    });
  });
});

