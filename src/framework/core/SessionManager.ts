/**
 * Gerenciador de sessões
 * Armazena dados de sessão por usuário
 */

import { SessionConfig, SessionData } from '../types/interfaces';

export class SessionManager {
  private sessions: Map<number, SessionData>;
  private ttl: number;

  constructor(config: SessionConfig) {
    this.sessions = new Map();
    this.ttl = config.ttl || 3600; // 1 hora por padrão

    // Limpar sessões expiradas a cada minuto
    if (this.ttl > 0) {
      setInterval(() => this.cleanExpiredSessions(), 60000);
    }
  }

  /**
   * Obtém sessão do usuário
   */
  async getSession(userId: number): Promise<SessionData> {
    let session = this.sessions.get(userId);

    if (!session) {
      // Criar nova sessão
      session = {
        userId,
        data: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.sessions.set(userId, session);
    } else {
      // Atualizar timestamp
      session.updatedAt = new Date();
    }

    return session;
  }

  /**
   * Salva sessão do usuário
   */
  async saveSession(userId: number, session: SessionData): Promise<void> {
    session.updatedAt = new Date();
    this.sessions.set(userId, session);
  }

  /**
   * Remove sessão do usuário
   */
  async deleteSession(userId: number): Promise<void> {
    this.sessions.delete(userId);
  }

  /**
   * Limpa todas as sessões
   */
  async clearAllSessions(): Promise<void> {
    this.sessions.clear();
  }

  /**
   * Limpa sessões expiradas
   */
  private cleanExpiredSessions(): void {
    const now = Date.now();
    const ttlMs = this.ttl * 1000;

    for (const [userId, session] of this.sessions.entries()) {
      const age = now - session.updatedAt.getTime();
      if (age > ttlMs) {
        this.sessions.delete(userId);
      }
    }
  }

  /**
   * Obtém número de sessões ativas
   */
  getActiveSessions(): number {
    return this.sessions.size;
  }
}

