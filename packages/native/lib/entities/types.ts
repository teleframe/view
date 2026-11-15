/**
 * @fileoverview MessageEntity type definitions for Telegram Bot API
 * @module @teleframe/view/native/entities/types
 */

export interface BaseMessageEntity {
    type: string;
    offset: number;
    length: number;
}

export interface CommonMessageEntity extends BaseMessageEntity {
    type:
        | 'mention'
        | 'hashtag'
        | 'cashtag'
        | 'bot_command'
        | 'url'
        | 'email'
        | 'phone_number'
        | 'bold'
        | 'italic'
        | 'underline'
        | 'strikethrough'
        | 'spoiler'
        | 'blockquote'
        | 'expandable_blockquote'
        | 'code';
}

export interface PreMessageEntity extends BaseMessageEntity {
    type: 'pre';
    language?: string;
}

export interface TextLinkMessageEntity extends BaseMessageEntity {
    type: 'text_link';
    url: string;
}

export interface TelegramUser {
    id: number;
    first_name?: string;
    is_bot?: boolean;
    last_name?: string;
    username?: string;
    [key: string]: any;
}

export interface TextMentionMessageEntity extends BaseMessageEntity {
    type: 'text_mention';
    user: any;
}

export interface CustomEmojiMessageEntity extends BaseMessageEntity {
    type: 'custom_emoji';
    custom_emoji_id: string;
}

export interface DateTimeMessageEntity extends BaseMessageEntity {
    type: 'date_time';
    unix_time: number;
    date_time_format: any;
}

export type MessageEntity =
    | CommonMessageEntity
    | PreMessageEntity
    | TextLinkMessageEntity
    | TextMentionMessageEntity
    | CustomEmojiMessageEntity
    | DateTimeMessageEntity;

export interface RenderResult {
    text: string;
    entities: MessageEntity[];
}
