/**
 * @fileoverview Attribute validation and tag whitelisting for Telegram HTML
 * @module @teleframe/view/native/sanitizer/attributes
 */

import { normalizeTimeFormat, normalizeTimestamp } from '../tags/time';
import { isValidUrl, TelegramSecurityError } from './escape';

export const TELEGRAM_ALLOWED_TAGS: Set<string> = new Set([
    'b',
    'strong',
    'i',
    'em',
    'u',
    'ins',
    's',
    'strike',
    'del',
    'tg-spoiler',
    'span',
    'a',
    'tg-emoji',
    'tg-time',
    'code',
    'pre',
    'blockquote',
]);

/**
 * Validates and filters attributes for a given Telegram HTML tag.
 */
export const filterTelegramAttributes = (
    tagName: string,
    props: Record<string, unknown>,
): Record<string, string | boolean> => {
    const validAttrs: Record<string, string | boolean> = {};

    switch (tagName) {
        case 'a': {
            const href = props.href;
            if (typeof href !== 'string' || href.trim() === '') {
                throw new Error(
                    '[Telegram Markup] Invalid attribute: <a> tag requires a non-empty "href" attribute.',
                );
            }
            if (!isValidUrl(href)) {
                throw new TelegramSecurityError(
                    `[Telegram Markup] Security Error: Invalid or prohibited URL in <a href="${href}">. Only http, https, tg, mailto, and tel schemes are allowed.`,
                );
            }
            if (/^tg:\/\/user\?id=/i.test(href)) {
                const userIdStr = href.slice('tg://user?id='.length);
                const userId = Number(userIdStr);
                if (!Number.isSafeInteger(userId) || userId <= 0) {
                    throw new TelegramSecurityError(
                        `[Telegram Markup] Invalid user ID in mention link: "${href}". User ID must be a positive integer.`,
                    );
                }
            }
            validAttrs.href = href;
            break;
        }

        case 'tg-emoji': {
            const emojiId = props['emoji-id'] ?? props.emojiId ?? (props as any).id;
            if (emojiId === undefined || emojiId === null || String(emojiId).trim() === '') {
                throw new Error(
                    '[Telegram Markup] Invalid attribute: <tg-emoji> requires a non-empty "emoji-id" attribute.',
                );
            }
            const strId = String(emojiId).trim();
            if (!/^\d+$/.test(strId)) {
                throw new TelegramSecurityError(
                    `[Telegram Markup] Invalid emoji-id: "${emojiId}". Telegram custom emoji ID must be a numeric string of digits.`,
                );
            }
            validAttrs['emoji-id'] = strId;
            break;
        }

        case 'tg-time': {
            if (
                props.unix === undefined ||
                props.unix === null ||
                String(props.unix).trim() === ''
            ) {
                throw new Error(
                    '[Telegram Markup] Invalid attribute: <tg-time> requires a valid "unix" attribute.',
                );
            }
            validAttrs.unix = String(normalizeTimestamp(props.unix));
            if (
                props.format !== undefined &&
                props.format !== null &&
                String(props.format).trim() !== ''
            ) {
                const format = normalizeTimeFormat(String(props.format).trim());
                if (format) validAttrs.format = format;
            }
            break;
        }

        case 'blockquote': {
            if (props.expandable === true) {
                validAttrs.expandable = true;
            }
            break;
        }

        case 'code': {
            const className = (props.class ?? props.className) as string | undefined;
            if (typeof className === 'string' && /^language-[\w#+-]+$/.test(className)) {
                validAttrs.class = className;
            }
            break;
        }

        case 'span': {
            const className = (props.class ?? props.className) as string | undefined;
            if (className === 'tg-spoiler') {
                validAttrs.class = 'tg-spoiler';
            }
            break;
        }

        default:
            break;
    }

    return validAttrs;
};
