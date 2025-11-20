/**
 * MenuPlugin Unit Tests
 * 
 * @author Paulo Renan <rennandeveloper@gmail.com>
 */

import { MenuPlugin, MenuBuilder } from '../../src/plugins/menu/MenuPlugin';
import { BotContext } from '../../src/framework/types/interfaces';

// Mock Telegraf
jest.mock('telegraf', () => ({
  Markup: {
    button: {
      callback: jest.fn((text, data) => ({ text, callback_data: data })),
      url: jest.fn((text, url) => ({ text, url }))
    },
    inlineKeyboard: jest.fn((buttons) => ({ inline_keyboard: buttons }))
  }
}));

describe('MenuPlugin', () => {
  let plugin: MenuPlugin;

  beforeEach(() => {
    plugin = new MenuPlugin();
  });

  describe('Menu Registration', () => {
    it('should register a menu', () => {
      const menu = MenuBuilder.createMenuBuilder('test')
        .setText('Test Menu')
        .addItem('Option 1', 'opt1')
        .build();

      plugin.registerMenu(menu);

      const retrieved = plugin.getMenu('test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test');
    });

    it('should retrieve registered menu', () => {
      const menu = MenuBuilder.createMenuBuilder('main')
        .setText('Main Menu')
        .build();

      plugin.registerMenu(menu);

      const retrieved = plugin.getMenu('main');
      expect(retrieved?.id).toBe('main');
    });

    it('should return undefined for non-existent menu', () => {
      const menu = plugin.getMenu('non-existent');
      expect(menu).toBeUndefined();
    });
  });

  describe('MenuBuilder', () => {
    it('should create menu with builder', () => {
      const menu = MenuBuilder.createMenuBuilder('test')
        .setTitle('Test')
        .setText('Test Menu')
        .build();

      expect(menu.id).toBe('test');
      expect(menu.title).toBe('Test');
      expect(menu.text).toBe('Test Menu');
    });

    it('should add items', () => {
      const menu = MenuBuilder.createMenuBuilder('test')
        .setText('Test')
        .addItem('Item 1', 'item1')
        .addItem('Item 2', 'item2')
        .build();

      expect(menu.items).toHaveLength(2);
      expect(menu.items[0].label).toBe('Item 1');
      expect(menu.items[0].action).toBe('item1');
    });

    it('should add URL items', () => {
      const menu = MenuBuilder.createMenuBuilder('test')
        .setText('Test')
        .addUrlItem('Website', 'https://example.com')
        .build();

      expect(menu.items).toHaveLength(1);
      expect(menu.items[0].url).toBe('https://example.com');
    });

    it('should set layout', () => {
      const menu = MenuBuilder.createMenuBuilder('test')
        .setText('Test')
        .setLayout('grid', 3)
        .build();

      expect(menu.layout).toBe('grid');
      expect(menu.columns).toBe(3);
    });
  });
});

