/**
 * MessageBuilder Unit Tests
 * 
 * @author Paulo Renan <rennandeveloper@gmail.com>
 */

import { MessageBuilder } from '../../../src/framework/utils/MessageBuilder';

// Mock Telegraf Markup
jest.mock('telegraf', () => ({
  Markup: {
    button: {
      callback: jest.fn((text, data) => ({ type: 'callback', text, callback_data: data })),
      url: jest.fn((text, url) => ({ type: 'url', text, url }))
    },
    inlineKeyboard: jest.fn((buttons) => ({ reply_markup: { inline_keyboard: buttons } }))
  }
}));

describe('MessageBuilder', () => {
  describe('Text Building', () => {
    it('should set text', () => {
      const message = MessageBuilder.create()
        .setText('Hello World')
        .build();

      expect(message.text).toBe('Hello World');
    });

    it('should set parse mode', () => {
      const message = MessageBuilder.create()
        .setText('*Bold*')
        .setParseMode('Markdown')
        .build();

      expect(message.parseMode).toBe('Markdown');
    });
  });

  describe('Button Building', () => {
    it('should add callback button', () => {
      const message = MessageBuilder.create()
        .setText('Choose:')
        .addButton('Click me', 'btn_data')
        .build();

      expect(message.markup).toBeDefined();
    });

    it('should add URL button', () => {
      const message = MessageBuilder.create()
        .setText('Visit:')
        .addUrlButton('Website', 'https://example.com')
        .build();

      expect(message.markup).toBeDefined();
    });

    it('should create multiple rows', () => {
      const message = MessageBuilder.create()
        .setText('Options:')
        .addButton('Button 1', 'btn1')
        .addButton('Button 2', 'btn2')
        .addButtonRow()
        .addButton('Button 3', 'btn3')
        .build();

      expect(message.markup).toBeDefined();
    });
  });

  describe('Static Create Method', () => {
    it('should create instance via static method', () => {
      const builder = MessageBuilder.create();
      expect(builder).toBeInstanceOf(MessageBuilder);
    });
  });

  describe('Fluent Interface', () => {
    it('should chain methods', () => {
      const message = MessageBuilder.create()
        .setText('Test')
        .setParseMode('Markdown')
        .addButton('Button', 'data')
        .build();

      expect(message.text).toBe('Test');
      expect(message.parseMode).toBe('Markdown');
      expect(message.markup).toBeDefined();
    });
  });
});

