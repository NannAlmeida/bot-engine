/**
 * HelpPlugin Unit Tests
 * 
 * @author Paulo Renan <rennandeveloper@gmail.com>
 */

import { HelpPlugin } from '../../src/plugins/help/HelpPlugin';

describe('HelpPlugin', () => {
  let plugin: HelpPlugin;

  beforeEach(() => {
    plugin = new HelpPlugin({
      mainHelpText: 'Test Help',
      topics: [
        {
          id: 'test1',
          title: 'Test Topic 1',
          content: 'Content 1',
          category: 'Test'
        },
        {
          id: 'test2',
          title: 'Test Topic 2',
          content: 'Content 2',
          category: 'Test'
        }
      ]
    });
  });

  describe('Topic Management', () => {
    it('should add topic', () => {
      plugin.addTopic({
        id: 'new-topic',
        title: 'New Topic',
        content: 'New content'
      });

      const topics = plugin.getTopics();
      expect(topics).toHaveLength(3);
    });

    it('should get all topics', () => {
      const topics = plugin.getTopics();
      expect(topics).toHaveLength(2);
      expect(topics[0].id).toBe('test1');
    });

    it('should remove topic', () => {
      const removed = plugin.removeTopic('test1');
      expect(removed).toBe(true);

      const topics = plugin.getTopics();
      expect(topics).toHaveLength(1);
    });

    it('should return false when removing non-existent topic', () => {
      const removed = plugin.removeTopic('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('Configuration', () => {
    it('should use default config', () => {
      const defaultPlugin = new HelpPlugin();
      expect(defaultPlugin).toBeDefined();
    });

    it('should accept custom config', () => {
      const customPlugin = new HelpPlugin({
        mainHelpText: 'Custom Help',
        backButtonText: 'Go Back'
      });
      expect(customPlugin).toBeDefined();
    });
  });
});

