/**
 * Sistema de logging
 */

import { ILogger } from '../types/interfaces';
import { LogLevel } from '../types/types';

export class ConsoleLogger implements ILogger {
  constructor(private level: LogLevel = 'info') {}

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.log(`ℹ️  [INFO] ${message}`, meta || '');
    }
  }

  error(message: string, error?: Error, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(`❌ [ERROR] ${message}`, error?.message || '', meta || '');
      if (error?.stack) {
        console.error(error.stack);
      }
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️  [WARN] ${message}`, meta || '');
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`🔍 [DEBUG] ${message}`, meta || '');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }
}

