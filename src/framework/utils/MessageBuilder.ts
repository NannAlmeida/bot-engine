/**
 * Builder para construção de mensagens com botões
 */

import { Markup } from 'telegraf';
import { IMessageBuilder, MessagePayload } from '../types/interfaces';
import { ParseMode } from '../types/types';

export class MessageBuilder implements IMessageBuilder {
  private text: string = '';
  private parseMode?: ParseMode;
  private buttons: any[][] = [[]];
  private currentRow: number = 0;

  setText(text: string): this {
    this.text = text;
    return this;
  }

  setParseMode(mode: ParseMode): this {
    this.parseMode = mode;
    return this;
  }

  addButton(text: string, callbackData: string): this {
    this.buttons[this.currentRow].push(
      Markup.button.callback(text, callbackData)
    );
    return this;
  }

  addUrlButton(text: string, url: string): this {
    this.buttons[this.currentRow].push(
      Markup.button.url(text, url)
    );
    return this;
  }

  addButtonRow(): this {
    if (this.buttons[this.currentRow].length > 0) {
      this.buttons.push([]);
      this.currentRow++;
    }
    return this;
  }

  build(): MessagePayload {
    const payload: MessagePayload = {
      text: this.text
    };

    if (this.parseMode) {
      payload.parseMode = this.parseMode as 'Markdown' | 'HTML' | 'MarkdownV2';
    }

    // Remover linhas vazias
    const filteredButtons = this.buttons.filter(row => row.length > 0);
    
    if (filteredButtons.length > 0) {
      payload.markup = Markup.inlineKeyboard(filteredButtons);
    }

    return payload;
  }

  /**
   * Método helper para enviar a mensagem diretamente
   */
  static create(): MessageBuilder {
    return new MessageBuilder();
  }
}

