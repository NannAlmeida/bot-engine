/**
 * Tipos auxiliares do framework
 */

/**
 * Tipo para funções assíncronas ou síncronas
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Tipo para callback de middleware
 */
export type NextFunction = () => Promise<void>;

/**
 * Tipo para eventos do bot
 */
export type BotEvent = 
  | 'start' 
  | 'stop' 
  | 'error' 
  | 'message' 
  | 'command' 
  | 'action' 
  | 'payment';

/**
 * Tipo para níveis de log
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Tipo para status de plugin
 */
export type PluginStatus = 'inactive' | 'initializing' | 'active' | 'error';

/**
 * Opções de parse mode
 */
export type ParseMode = 'Markdown' | 'HTML' | 'MarkdownV2';

/**
 * Tipos de botões
 */
export type ButtonType = 'callback' | 'url' | 'pay';

/**
 * Configuração de botão
 */
export interface ButtonConfig {
  type: ButtonType;
  text: string;
  data?: string;
  url?: string;
}

/**
 * Resultado de operação
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Configuração de retry
 */
export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff?: 'linear' | 'exponential';
}

