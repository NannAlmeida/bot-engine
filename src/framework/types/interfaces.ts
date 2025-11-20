/**
 * Interfaces do Framework de Bot Telegram
 * Define contratos para todos os componentes do framework
 */

import { Context as TelegrafContext, Markup } from 'telegraf';

/**
 * Contexto estendido do bot com sessão e helpers
 */
export interface BotContext extends TelegrafContext {
  session?: SessionData;
  state: any;
}

/**
 * Dados de sessão do usuário
 */
export interface SessionData {
  userId: number;
  username?: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuração do bot
 */
export interface BotConfig {
  token: string;
  name?: string;
  description?: string;
  plugins?: IPlugin[];
  middleware?: IMiddleware[];
  session?: SessionConfig;
}

/**
 * Configuração de sessão
 */
export interface SessionConfig {
  enabled: boolean;
  ttl?: number; // Time to live em segundos
  storage?: 'memory' | 'redis' | 'custom';
}

/**
 * Interface base para plugins
 */
export interface IPlugin {
  name: string;
  version: string;
  description?: string;
  
  /**
   * Inicializa o plugin
   */
  initialize(engine: IBotEngine): void | Promise<void>;
  
  /**
   * Registra comandos, ações, etc.
   */
  register(): void | Promise<void>;
  
  /**
   * Cleanup ao desligar o bot
   */
  destroy?(): void | Promise<void>;
}

/**
 * Interface para middleware
 */
export interface IMiddleware {
  name: string;
  
  /**
   * Executa antes do handler
   */
  execute(ctx: BotContext, next: () => Promise<void>): Promise<void>;
}

/**
 * Handler de comando
 */
export interface ICommandHandler {
  command: string;
  description?: string;
  handler: (ctx: BotContext) => void | Promise<void>;
  middleware?: IMiddleware[];
}

/**
 * Handler de ação (callback query)
 */
export interface IActionHandler {
  action: string | RegExp;
  handler: (ctx: BotContext) => void | Promise<void>;
  middleware?: IMiddleware[];
}

/**
 * Handler de mensagem
 */
export interface IMessageHandler {
  pattern: string | RegExp;
  handler: (ctx: BotContext) => void | Promise<void>;
  middleware?: IMiddleware[];
}

/**
 * Interface do motor do bot
 */
export interface IBotEngine {
  /**
   * Registra um comando
   */
  registerCommand(handler: ICommandHandler): void;
  
  /**
   * Registra uma ação (callback query)
   */
  registerAction(handler: IActionHandler): void;
  
  /**
   * Registra um handler de mensagem
   */
  registerMessage(handler: IMessageHandler): void;
  
  /**
   * Adiciona middleware global
   */
  use(middleware: IMiddleware): void;
  
  /**
   * Adiciona plugin
   */
  addPlugin(plugin: IPlugin): void;
  
  /**
   * Inicia o bot
   */
  launch(): Promise<void>;
  
  /**
   * Para o bot
   */
  stop(signal?: string): void;
  
  /**
   * Obtém informações do bot
   */
  getBotInfo(): any;
  
  /**
   * Obtém logger
   */
  getLogger(): ILogger;
}

/**
 * Builder para mensagens com botões
 */
export interface IMessageBuilder {
  setText(text: string): this;
  setParseMode(mode: 'Markdown' | 'HTML'): this;
  addButton(text: string, callbackData: string): this;
  addButtonRow(): this;
  addUrlButton(text: string, url: string): this;
  build(): MessagePayload;
}

/**
 * Payload de mensagem
 */
export interface MessagePayload {
  text: string;
  parseMode?: 'Markdown' | 'HTML' | 'MarkdownV2';
  markup?: any;
}

/**
 * Interface para serviços de pagamento
 */
export interface IPaymentService {
  /**
   * Gera código de pagamento
   */
  generatePaymentCode(params: PaymentParams): Promise<PaymentCode>;
  
  /**
   * Valida pagamento
   */
  validatePayment?(paymentId: string): Promise<boolean>;
  
  /**
   * Verifica status do pagamento
   */
  checkPaymentStatus?(paymentId: string): Promise<PaymentStatus>;
}

/**
 * Parâmetros de pagamento
 */
export interface PaymentParams {
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Código de pagamento gerado
 */
export interface PaymentCode {
  code: string;
  qrCode?: Buffer;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Status de pagamento
 */
export interface PaymentStatus {
  id: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  amount: number;
  paidAt?: Date;
}

/**
 * Menu item configuration
 */
export interface MenuItem {
  label: string;
  action?: string;
  url?: string;
  submenu?: MenuItem[];
}

/**
 * Menu configuration
 */
export interface MenuConfig {
  items: MenuItem[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
}

/**
 * Logger interface
 */
export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

