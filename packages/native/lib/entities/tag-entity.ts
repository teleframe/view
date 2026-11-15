/**
 * @fileoverview Maps resolved JSX tag elements to Telegram message entities.
 * @module @teleframe/view/native/entities/tag-entity
 */

import { isValidUrl, TelegramSecurityError } from '../sanitizer';
import { normalizeTimeFormat, normalizeTimestamp } from '../tags/time';
import type { DateTimeMessageEntity, MessageEntity } from './types';

export const buildTagEntity = (
    tag: string,
    props: Record<string, unknown>,
    startOffset: number,
    length: number,
    depth: number,
    rawEntities: Array<{ entity: MessageEntity; depth: number }>,
): void => {
    switch (tag) {
        case 'b':
        case 'strong':
            rawEntities.push({ entity: { type: 'bold', offset: startOffset, length }, depth });
            break;
        case 'i':
        case 'em':
            rawEntities.push({ entity: { type: 'italic', offset: startOffset, length }, depth });
            break;
        case 'u':
        case 'ins':
            rawEntities.push({ entity: { type: 'underline', offset: startOffset, length }, depth });
            break;
        case 's':
        case 'strike':
        case 'del':
            rawEntities.push({
                entity: { type: 'strikethrough', offset: startOffset, length },
                depth,
            });
            break;
        case 'tg-spoiler':
            rawEntities.push({ entity: { type: 'spoiler', offset: startOffset, length }, depth });
            break;
        case 'span':
            if ((props.class ?? props.className) === 'tg-spoiler') {
                rawEntities.push({
                    entity: { type: 'spoiler', offset: startOffset, length },
                    depth,
                });
            }
            break;
        case 'blockquote':
            rawEntities.push({
                entity: {
                    type: props.expandable === true ? 'expandable_blockquote' : 'blockquote',
                    offset: startOffset,
                    length,
                },
                depth,
            });
            break;
        case 'code':
        case 'mono':
            rawEntities.push({ entity: { type: 'code', offset: startOffset, length }, depth });
            break;
        case 'a': {
            const href = typeof props.href === 'string' ? props.href.trim() : '';
            if (!href)
                throw new Error('[Telegram Markup] <a> tag requires a non-empty "href" attribute.');
            if (!isValidUrl(href)) {
                throw new TelegramSecurityError(
                    `[Telegram Markup] Security Error: Invalid or prohibited URL in <a href="${href}">. Only http, https, tg, mailto, and tel schemes are allowed.`,
                );
            }
            if (/^tg:\/\/user\?id=/i.test(href)) {
                const userId = Number(href.slice('tg://user?id='.length));
                if (!Number.isSafeInteger(userId) || userId <= 0) {
                    throw new TelegramSecurityError(
                        `[Telegram Markup] Invalid user ID in mention link: "${href}". User ID must be a positive integer.`,
                    );
                }
                rawEntities.push({
                    entity: {
                        type: 'text_mention',
                        offset: startOffset,
                        length,
                        user: { id: userId },
                    },
                    depth,
                });
            } else {
                rawEntities.push({
                    entity: { type: 'text_link', offset: startOffset, length, url: href },
                    depth,
                });
            }
            break;
        }
        case 'user': {
            const rawId = props.id;
            if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
                throw new Error('[Telegram Markup] <user> requires a valid "id" prop.');
            }
            const userId = Number(rawId);
            if (!Number.isSafeInteger(userId) || userId <= 0) {
                throw new TelegramSecurityError(
                    `[Telegram Markup] Invalid user ID: "${rawId}". Telegram user ID must be a positive integer.`,
                );
            }
            rawEntities.push({
                entity: {
                    type: 'text_mention',
                    offset: startOffset,
                    length,
                    user: { id: userId },
                },
                depth,
            });
            break;
        }
        case 'tg-emoji': {
            const rawId = props['emoji-id'] ?? props.emojiId ?? props.id;
            if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
                throw new Error(
                    '[Telegram Markup] Invalid attribute: <tg-emoji> requires a non-empty "emoji-id" attribute.',
                );
            }
            const emojiId = String(rawId).trim();
            if (!/^\d+$/.test(emojiId)) {
                throw new TelegramSecurityError(
                    `[Telegram Markup] Invalid emoji-id: "${rawId}". Telegram custom emoji ID must be a numeric string of digits.`,
                );
            }
            rawEntities.push({
                entity: {
                    type: 'custom_emoji',
                    offset: startOffset,
                    length,
                    custom_emoji_id: emojiId,
                },
                depth,
            });
            break;
        }
        case 'tg-time': {
            const timeEntity: DateTimeMessageEntity = {
                type: 'date_time',
                offset: startOffset,
                length,
                unix_time: normalizeTimestamp(props.unix),
                date_time_format: normalizeTimeFormat(props.format as string | undefined) ?? '',
            };
            rawEntities.push({ entity: timeEntity, depth });
            break;
        }
    }
};
