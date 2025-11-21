/**
 * Motor principal do bot
 * Gerencia todo o ciclo de vida do bot e plugins
 */

import { Telegraf } from 'telegraf';
import {
  BotConfig,
  BotContext,
  IBotEngine,
  ICommandHandler,
  IActionHandler,
  IMessageHandler,
  IMiddleware,
  IPlugin,
  ILogger
} from '../types/interfaces';
import { SessionManager } from './SessionManager';
import { ConsoleLogger } from '../utils/Logger';

export class BotEngine implements IBotEngine {
  private bot: Telegraf<BotContext>;
  private plugins: Map<string, IPlugin>;
  private middleware: IMiddleware[];
  private sessionManager?: SessionManager;
  private logger: ILogger;
  private isRunning: boolean = false;

  constructor(private config: BotConfig, logger?: ILogger) {
    this.bot = new Telegraf<BotContext>(config.token);
    this.plugins = new Map();
    this.middleware = [];
    this.logger = logger || new ConsoleLogger();

    // Configurar sessão se habilitado
    if (config.session?.enabled) {
      this.sessionManager = new SessionManager(config.session);
      this.setupSessionMiddleware();
    }

    // Adicionar middleware global
    if (config.middleware) {
      config.middleware.forEach(m => this.use(m));
    }

    // Adicionar plugins
    if (config.plugins) {
      config.plugins.forEach(p => this.addPlugin(p));
    }

    // Configurar error handler
    this.setupErrorHandler();
  }

  /**
   * Registra um comando
   */
  registerCommand(handler: ICommandHandler): void {
    this.logger.debug(`Registrando comando: /${handler.command}`);

    this.bot.command(handler.command, async (ctx) => {
      try {
        // Executar middleware específico do comando
        if (handler.middleware) {
          for (const mw of handler.middleware) {
            let nextCalled = false;
            const next = async () => { nextCalled = true; };
            await mw.execute(ctx, next);
            if (!nextCalled) return;
          }
        }

        // Executar handler
        await handler.handler(ctx);
      } catch (error) {
        this.logger.error(`Erro no comando /${handler.command}`, error as Error);
        await this.handleError(ctx, error);
      }
    });
  }

  /**
   * Registra uma ação (callback query)
   */
  registerAction(handler: IActionHandler): void {
    const actionStr = typeof handler.action === 'string' 
      ? handler.action 
      : handler.action.toString();
    
    this.logger.debug(`Registrando ação: ${actionStr}`);

    this.bot.action(handler.action, async (ctx) => {
      try {
        // Responder callback query
        await ctx.answerCbQuery();

        // Executar middleware específico da ação
        if (handler.middleware) {
          for (const mw of handler.middleware) {
            let nextCalled = false;
            const next = async () => { nextCalled = true; };
            await mw.execute(ctx, next);
            if (!nextCalled) return;
          }
        }

        // Executar handler
        await handler.handler(ctx);
      } catch (error) {
        this.logger.error(`Erro na ação ${actionStr}`, error as Error);
        await this.handleError(ctx, error);
      }
    });
  }

  /**
   * Registra um handler de mensagem
   */
  registerMessage(handler: IMessageHandler): void {
    this.logger.debug(`Registrando message handler`);

    this.bot.hears(handler.pattern, async (ctx) => {
      try {
        // Executar middleware específico
        if (handler.middleware) {
          for (const mw of handler.middleware) {
            let nextCalled = false;
            const next = async () => { nextCalled = true; };
            await mw.execute(ctx, next);
            if (!nextCalled) return;
          }
        }

        // Executar handler
        await handler.handler(ctx);
      } catch (error) {
        this.logger.error('Erro no message handler', error as Error);
        await this.handleError(ctx, error);
      }
    });
  }

  /**
   * Adiciona middleware global
   */
  use(middleware: IMiddleware): void {
    this.logger.debug(`Adicionando middleware: ${middleware.name}`);
    this.middleware.push(middleware);

    this.bot.use(async (ctx, next) => {
      await middleware.execute(ctx, next);
    });
  }

  /**
   * Adiciona plugin
   */
  addPlugin(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      this.logger.warn(`Plugin ${plugin.name} já está registrado`);
      return;
    }

    this.logger.info(`Adicionando plugin: ${plugin.name} v${plugin.version}`);
    this.plugins.set(plugin.name, plugin);
  }

  /**
   * Inicializa todos os plugins
   */
  private async initializePlugins(): Promise<void> {
    const pluginCount = this.plugins.size;
    
    if (pluginCount === 0) {
      this.logger.info('Nenhum plugin para inicializar');
      return;
    }

    this.logger.info(`Inicializando ${pluginCount} plugin(s)...`);

    for (const [name, plugin] of this.plugins) {
      try {
        this.logger.info(`  → Inicializando plugin: ${name}`);
        await plugin.initialize(this);
        await plugin.register();
        this.logger.info(`  ✓ Plugin ${name} inicializado com sucesso`);
      } catch (error) {
        this.logger.error(`Erro ao inicializar plugin ${name}`, error as Error);
        throw error;
      }
    }

    this.logger.info(`✓ Todos os ${pluginCount} plugin(s) foram inicializados`);
  }

  /**
   * Inicia o bot
   */
  async launch(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Bot já está rodando');
      return;
    }

    try {
      // Inicializar plugins
      await this.initializePlugins();

      // Iniciar bot
      await this.bot.launch();
      this.isRunning = true;

      const botInfo = await this.bot.telegram.getMe();
      this.logger.info(`🤖 Bot iniciado: @${botInfo.username}`);
      
      if (this.config.name) {
        this.logger.info(`📱 Nome: ${this.config.name}`);
      }

      // Graceful stop
      process.once('SIGINT', () => this.stop('SIGINT'));
      process.once('SIGTERM', () => this.stop('SIGTERM'));

    } catch (error) {
      this.logger.error('Erro ao iniciar bot', error as Error);
      throw error;
    }
  }

  /**
   * Para o bot
   */
  stop(signal?: string): void {
    if (!this.isRunning) {
      return;
    }

    this.logger.info(`Parando bot... (${signal || 'manual'})`);

    // Destruir plugins
    for (const [name, plugin] of this.plugins) {
      try {
        if (plugin.destroy) {
          plugin.destroy();
        }
      } catch (error) {
        this.logger.error(`Erro ao destruir plugin ${name}`, error as Error);
      }
    }

    this.bot.stop(signal);
    this.isRunning = false;
    this.logger.info('Bot parado');
  }

  /**
   * Obtém informações do bot
   */
  getBotInfo(): any {
    return this.bot.botInfo;
  }

  /**
   * Obtém instância do Telegraf (para casos avançados)
   */
  getTelegrafInstance(): Telegraf<BotContext> {
    return this.bot;
  }

  /**
   * Configura middleware de sessão
   */
  private setupSessionMiddleware(): void {
    if (!this.sessionManager) return;

    this.bot.use(async (ctx, next) => {
      if (!ctx.from) {
        await next();
        return;
      }

      // Carregar ou criar sessão
      ctx.session = await this.sessionManager!.getSession(ctx.from.id);

      // Continuar processamento
      await next();

      // Salvar sessão
      if (ctx.session) {
        await this.sessionManager!.saveSession(ctx.from.id, ctx.session);
      }
    });
  }

  /**
   * Configura handler de erros
   */
  private setupErrorHandler(): void {
    this.bot.catch((err, ctx) => {
      this.logger.error('Erro não tratado no bot', err as Error);
      this.handleError(ctx, err);
    });
  }

  /**
   * Trata erros e envia mensagem ao usuário
   */
  private async handleError(ctx: BotContext, error: unknown): Promise<void> {
    try {
      await ctx.reply('❌ Ocorreu um erro. Por favor, tente novamente.');
    } catch (e) {
      this.logger.error('Erro ao enviar mensagem de erro', e as Error);
    }
  }

  /**
   * Obtém logger
   */
  getLogger(): ILogger {
    return this.logger;
  }
}

