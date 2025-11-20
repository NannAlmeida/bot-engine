/**
 * Plugin de menu interativo
 * Gerencia menus com botões e navegação
 */

import { Plugin } from '../../framework/plugins/Plugin';
import { BotContext, MenuItem, MenuConfig } from '../../framework/types/interfaces';
import { MessageBuilder } from '../../framework/utils/MessageBuilder';
import { Markup } from 'telegraf';

export interface MenuDefinition {
  id: string;
  title: string;
  text: string;
  items: MenuItem[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
}

export class MenuPlugin extends Plugin {
  name = 'menu';
  version = '1.0.0';
  description = 'Plugin para gerenciamento de menus interativos';

  private menus: Map<string, MenuDefinition> = new Map();

  async register(): Promise<void> {
    this.logger.info('Plugin de menu registrado');
  }

  /**
   * Registra um menu
   */
  registerMenu(menu: MenuDefinition): void {
    this.menus.set(menu.id, menu);
    this.logger.debug(`Menu registrado: ${menu.id}`);
  }

  /**
   * Obtém um menu
   */
  getMenu(menuId: string): MenuDefinition | undefined {
    return this.menus.get(menuId);
  }

  /**
   * Renderiza um menu e envia para o usuário
   */
  async renderMenu(ctx: BotContext, menuId: string): Promise<void> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      throw new Error(`Menu não encontrado: ${menuId}`);
    }

    const buttons = this.buildButtons(menu.items, menu.layout, menu.columns);
    
    await ctx.reply(menu.text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });
  }

  /**
   * Edita menu existente
   */
  async editMenu(ctx: BotContext, menuId: string): Promise<void> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      throw new Error(`Menu não encontrado: ${menuId}`);
    }

    const buttons = this.buildButtons(menu.items, menu.layout, menu.columns);
    
    try {
      await ctx.editMessageText(menu.text, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      });
    } catch (error) {
      // Se não conseguir editar, enviar nova mensagem
      await this.renderMenu(ctx, menuId);
    }
  }

  /**
   * Constrói botões baseado no layout
   */
  private buildButtons(
    items: MenuItem[], 
    layout: string = 'vertical',
    columns: number = 2
  ): any[][] {
    const buttons: any[][] = [];
    
    if (layout === 'vertical') {
      // Um botão por linha
      items.forEach(item => {
        if (item.url) {
          buttons.push([Markup.button.url(item.label, item.url)]);
        } else if (item.action) {
          buttons.push([Markup.button.callback(item.label, item.action)]);
        }
      });
    } else if (layout === 'horizontal') {
      // Todos os botões na mesma linha
      const row: any[] = [];
      items.forEach(item => {
        if (item.url) {
          row.push(Markup.button.url(item.label, item.url));
        } else if (item.action) {
          row.push(Markup.button.callback(item.label, item.action));
        }
      });
      buttons.push(row);
    } else if (layout === 'grid') {
      // Grade com número de colunas especificado
      let currentRow: any[] = [];
      items.forEach((item, index) => {
        if (item.url) {
          currentRow.push(Markup.button.url(item.label, item.url));
        } else if (item.action) {
          currentRow.push(Markup.button.callback(item.label, item.action));
        }
        
        // Se completou uma linha ou é o último item
        if ((index + 1) % columns === 0 || index === items.length - 1) {
          buttons.push(currentRow);
          currentRow = [];
        }
      });
    }
    
    return buttons;
  }

}

/**
 * Builder fluente para criação de menus
 */
export class MenuBuilder {
  /**
   * Cria um builder de menu fluente
   */
  static createMenuBuilder(id: string): MenuBuilder {
    return new MenuBuilder(id);
  }
  private menu: MenuDefinition;

  constructor(id: string) {
    this.menu = {
      id,
      title: '',
      text: '',
      items: [],
      layout: 'vertical'
    };
  }

  setTitle(title: string): this {
    this.menu.title = title;
    return this;
  }

  setText(text: string): this {
    this.menu.text = text;
    return this;
  }

  setLayout(layout: 'vertical' | 'horizontal' | 'grid', columns?: number): this {
    this.menu.layout = layout;
    if (columns) {
      this.menu.columns = columns;
    }
    return this;
  }

  addItem(label: string, action: string): this {
    this.menu.items.push({ label, action });
    return this;
  }

  addUrlItem(label: string, url: string): this {
    this.menu.items.push({ label, url });
    return this;
  }

  build(): MenuDefinition {
    return this.menu;
  }
}

