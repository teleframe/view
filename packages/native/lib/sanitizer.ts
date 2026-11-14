/**
 * @fileoverview Central sanitization, escaping, and URL validation for Telegram formatting
 * @module @telegram-markup/native/sanitizer
 */

/**
 * Escapes characters with special meaning in Telegram HTML: &, <, >
 * All dynamic plain text strings MUST be processed through this function.
 */
export const escapeHtml = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 * Escapes attribute values in Telegram HTML: &, <, >, "
 */
export const escapeAttr = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    return escapeHtml(value).replace(/"/g, '&quot;');
};

/**
 * Whitelist of URL schemes supported by Telegram Bot API.
 */
const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'tg:', 'mailto:', 'tel:'];

/**
 * Validates whether a URL is secure and compliant with Telegram Bot API.
 * Allows standard web URLs (http/https) and Telegram internal schemas (tg://user?id=..., tg://resolve, etc.)
 * Strictly rejects dangerous protocols (javascript:, data:, vbscript:) and malformed URLs.
 */
export const isValidUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();

    // Check for explicit dangerous patterns first
    if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
        return false;
    }

    // Handle tg:// schemes directly
    if (/^tg:\/\//i.test(trimmed)) {
        // tg://user?id=... or tg://resolve?domain=...
        return true;
    }

    try {
        const parsed = new URL(trimmed);
        return ALLOWED_URL_SCHEMES.includes(parsed.protocol.toLowerCase());
    } catch {
        // Relative or malformed URLs
        return false;
    }
};

/**
 * Whitelisted Telegram HTML tags.
 */
export const TELEGRAM_ALLOWED_TAGS = new Set([
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
            if (typeof href === 'string') {
                if (!isValidUrl(href)) {
                    throw new Error(
                        `[Telegram Markup] Security Error: Invalid or prohibited URL in <a href="${href}">. Only http, https, tg, mailto, and tel schemes are allowed.`,
                    );
                }
                validAttrs.href = href;
            }
            break;
        }

        case 'tg-emoji': {
            const emojiId = props['emoji-id'] ?? props.emojiId;
            if (emojiId !== undefined && emojiId !== null) {
                validAttrs['emoji-id'] = String(emojiId);
            }
            break;
        }

        case 'tg-time': {
            if (props.unix !== undefined && props.unix !== null) {
                validAttrs.unix = String(props.unix);
            }
            if (props.format !== undefined && props.format !== null) {
                validAttrs.format = String(props.format);
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
