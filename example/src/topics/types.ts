/**
 * @fileoverview Type definitions for Telegram forum topics management
 * @module examples/src/topics/types
 */

/**
 * Recognized topic categories in the example bot forum supergroup
 */
export type TopicCategory = 'native' | 'rich-text' | 'widget' | 'telegraph';

/**
 * Forum topic descriptor containing thread ID and display name
 */
export interface ForumTopicInfo {
    threadId: number;
    name: string;
}

/**
 * Mapping of chat ID to its active forum topic thread IDs
 */
export type ChatForumTopics = Partial<Record<TopicCategory, ForumTopicInfo>>;

/**
 * Overall persistent state storing forum topics across all chats
 */
export type ForumTopicsState = Record<string, ChatForumTopics>;
