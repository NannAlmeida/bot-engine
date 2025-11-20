/**
 * SessionManager Unit Tests
 * 
 * @author Paulo Renan <rennandeveloper@gmail.com>
 */

import { SessionManager } from '../../../src/framework/core/SessionManager';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager({
      enabled: true,
      ttl: 3600
    });
  });

  describe('Session Creation', () => {
    it('should create a new session', async () => {
      const session = await sessionManager.getSession(123);

      expect(session).toBeDefined();
      expect(session.userId).toBe(123);
      expect(session.data).toEqual({});
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
    });

    it('should return existing session', async () => {
      const session1 = await sessionManager.getSession(123);
      session1.data.test = 'value';

      const session2 = await sessionManager.getSession(123);

      expect(session2.data.test).toBe('value');
    });
  });

  describe('Session Storage', () => {
    it('should save session data', async () => {
      const session = await sessionManager.getSession(123);
      session.data.count = 1;

      await sessionManager.saveSession(123, session);

      const retrieved = await sessionManager.getSession(123);
      expect(retrieved.data.count).toBe(1);
    });

    it('should update timestamp on save', async () => {
      const session = await sessionManager.getSession(123);
      const originalTime = session.updatedAt.getTime();

      await new Promise(resolve => setTimeout(resolve, 10));

      await sessionManager.saveSession(123, session);
      const updated = await sessionManager.getSession(123);

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalTime);
    });
  });

  describe('Session Deletion', () => {
    it('should delete a session', async () => {
      await sessionManager.getSession(123);
      await sessionManager.deleteSession(123);

      const session = await sessionManager.getSession(123);
      expect(session.data).toEqual({});
    });

    it('should clear all sessions', async () => {
      await sessionManager.getSession(123);
      await sessionManager.getSession(456);

      await sessionManager.clearAllSessions();

      expect(sessionManager.getActiveSessions()).toBe(0);
    });
  });

  describe('Active Sessions', () => {
    it('should count active sessions', async () => {
      await sessionManager.getSession(123);
      await sessionManager.getSession(456);

      expect(sessionManager.getActiveSessions()).toBe(2);
    });
  });
});

