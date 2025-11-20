/**
 * Classe base abstrata para plugins
 */

import { IPlugin, IBotEngine, ILogger } from '../types/interfaces';

export abstract class Plugin implements IPlugin {
  abstract name: string;
  abstract version: string;
  abstract description?: string;

  protected engine!: IBotEngine;
  protected logger!: ILogger;

  /**
   * Inicializa o plugin
   */
  async initialize(engine: IBotEngine): Promise<void> {
    this.engine = engine;
    this.logger = engine.getLogger();
    await this.onInitialize();
  }

  /**
   * Registra comandos, ações, etc.
   */
  abstract register(): void | Promise<void>;

  /**
   * Hook chamado durante inicialização (override se necessário)
   */
  protected async onInitialize(): Promise<void> {
    // Override em plugins específicos
  }

  /**
   * Cleanup ao desligar o bot (override se necessário)
   */
  async destroy(): Promise<void> {
    await this.onDestroy();
  }

  /**
   * Hook chamado durante destruição (override se necessário)
   */
  protected async onDestroy(): Promise<void> {
    // Override em plugins específicos
  }
}

