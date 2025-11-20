/**
 * Plugin de ajuda
 * Gerencia sistema de ajuda e documentação
 */

import { Plugin } from '../../framework/plugins/Plugin';
import { BotContext } from '../../framework/types/interfaces';
import { Markup } from 'telegraf';

export interface HelpTopic {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export interface HelpConfig {
  mainHelpText?: string;
  topics?: HelpTopic[];
  backButtonText?: string;
}

export class HelpPlugin extends Plugin {
  name = 'help';
  version = '1.0.0';
  description = 'Plugin para sistema de ajuda';

  private topics: Map<string, HelpTopic> = new Map();
  private config: HelpConfig;

  constructor(config: HelpConfig = {}) {
    super();
    this.config = {
      mainHelpText: 'ℹ️ *Ajuda*\n\nSelecione um tópico abaixo:',
      backButtonText: '« Voltar',
      ...config
    };

    // Registrar tópicos iniciais
    if (config.topics) {
      config.topics.forEach(topic => this.addTopic(topic));
    }
  }

  async register(): Promise<void> {
    // Registrar comando de ajuda
    this.engine.registerCommand({
      command: 'ajuda',
      description: 'Mostra informações de ajuda',
      handler: (ctx) => this.showMainHelp(ctx)
    });

    // Registrar ação de ajuda
    this.engine.registerAction({
      action: 'ajuda',
      handler: (ctx) => this.showMainHelp(ctx)
    });

    // Registrar ação de voltar
    this.engine.registerAction({
      action: 'help:back',
      handler: (ctx) => this.showMainHelp(ctx)
    });

    this.logger.info('Plugin de ajuda registrado');
  }

  /**
   * Adiciona um tópico de ajuda
   */
  addTopic(topic: HelpTopic): void {
    this.topics.set(topic.id, topic);
    
    // Registrar ação para este tópico
    this.engine.registerAction({
      action: `help:${topic.id}`,
      handler: (ctx) => this.showTopic(ctx, topic.id)
    });

    this.logger.debug(`Tópico de ajuda adicionado: ${topic.id}`);
  }

  /**
   * Mostra ajuda principal
   */
  async showMainHelp(ctx: BotContext): Promise<void> {
    const buttons: any[][] = [];

    // Agrupar tópicos por categoria
    const categories = new Map<string, HelpTopic[]>();
    
    for (const topic of this.topics.values()) {
      const category = topic.category || 'Geral';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(topic);
    }

    // Criar botões por categoria
    for (const [category, topics] of categories) {
      topics.forEach(topic => {
        buttons.push([
          Markup.button.callback(topic.title, `help:${topic.id}`)
        ]);
      });
    }

    const message = this.config.mainHelpText || 'ℹ️ *Ajuda*\n\nSelecione um tópico:';

    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      });
    } catch (error) {
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      });
    }
  }

  /**
   * Mostra um tópico específico
   */
  async showTopic(ctx: BotContext, topicId: string): Promise<void> {
    const topic = this.topics.get(topicId);
    
    if (!topic) {
      await ctx.reply('Tópico não encontrado.');
      return;
    }

    const buttons = [
      [Markup.button.callback(this.config.backButtonText || '« Voltar', 'help:back')]
    ];

    try {
      await ctx.editMessageText(topic.content, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      });
    } catch (error) {
      await ctx.reply(topic.content, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
      });
    }
  }

  /**
   * Obtém todos os tópicos
   */
  getTopics(): HelpTopic[] {
    return Array.from(this.topics.values());
  }

  /**
   * Remove um tópico
   */
  removeTopic(topicId: string): boolean {
    return this.topics.delete(topicId);
  }
}

