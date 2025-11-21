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
 * Tipo para eventos do bot (legado)
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
 * Todos os eventos suportados pelo Telegraf
 */
export type TelegrafEvent =
  | 'text'
  | 'sticker'
  | 'animation'
  | 'audio'
  | 'document'
  | 'photo'
  | 'video'
  | 'video_note'
  | 'voice'
  | 'callback_query'
  | 'channel_post'
  | 'chat_member'
  | 'chosen_inline_result'
  | 'edited_channel_post'
  | 'message_reaction'
  | 'message_reaction_count'
  | 'edited_message'
  | 'inline_query'
  | 'message'
  | 'my_chat_member'
  | 'pre_checkout_query'
  | 'poll_answer'
  | 'poll'
  | 'shipping_query'
  | 'chat_join_request'
  | 'chat_boost'
  | 'removed_chat_boost'
  | 'has_media_spoiler'
  | 'contact'
  | 'dice'
  | 'location'
  | 'new_chat_members'
  | 'left_chat_member'
  | 'new_chat_title'
  | 'new_chat_photo'
  | 'delete_chat_photo'
  | 'group_chat_created'
  | 'supergroup_chat_created'
  | 'channel_chat_created'
  | 'message_auto_delete_timer_changed'
  | 'migrate_to_chat_id'
  | 'migrate_from_chat_id'
  | 'pinned_message'
  | 'invoice'
  | 'successful_payment'
  | 'users_shared'
  | 'chat_shared'
  | 'connected_website'
  | 'write_access_allowed'
  | 'passport_data'
  | 'proximity_alert_triggered'
  | 'boost_added'
  | 'forum_topic_created'
  | 'forum_topic_edited'
  | 'forum_topic_closed'
  | 'forum_topic_reopened'
  | 'general_forum_topic_hidden'
  | 'general_forum_topic_unhidden'
  | 'giveaway_created'
  | 'giveaway'
  | 'giveaway_winners'
  | 'giveaway_completed'
  | 'video_chat_scheduled'
  | 'video_chat_started'
  | 'video_chat_ended'
  | 'video_chat_participants_invited'
  | 'web_app_data'
  | 'game'
  | 'story'
  | 'venue'
  | 'forward_date';

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

