/**
 * @fileoverview Telegram Bot API message and caption length limits validation
 * @module @telegram-markup/native/validation/limits
 */

export const TELEGRAM_LIMITS = {
    MESSAGE_MIN_LENGTH: 1,
    MESSAGE_MAX_LENGTH: 4096,
    CAPTION_MIN_LENGTH: 0,
    CAPTION_MAX_LENGTH: 1024,
} as const;

export class TelegramLimitError extends Error {
    public readonly limitType: 'message' | 'caption';
    public readonly actualLength: number;
    public readonly limitLength: number;

    constructor(
        message: string,
        limitType: 'message' | 'caption',
        actualLength: number,
        limitLength: number,
    ) {
        super(message);
        this.name = 'TelegramLimitError';
        this.limitType = limitType;
        this.actualLength = actualLength;
        this.limitLength = limitLength;
    }
}

/**
 * Strips Telegram-allowed HTML tags and decodes Telegram HTML entities
 * (including named entities &quot;, &amp;, &lt;, &gt; and all numerical character references &#38;, &#x26;).
 * Returns the plain text representation as parsed by Telegram Bot API.
 *
 * In Telegram Bot API, message length (1–4096) and caption length (0–1024)
 * are calculated based on the UTF-16 code units of text AFTER entities/HTML parsing.
 */
export const stripTelegramHtml = (html: string): string => {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&(quot|amp|lt|gt|#(?:[xX][0-9a-fA-F]+|\d+));/g, (match, entity: string) => {
            switch (entity) {
                case 'quot':
                    return '"';
                case 'amp':
                    return '&';
                case 'lt':
                    return '<';
                case 'gt':
                    return '>';
                default: {
                    if (entity.startsWith('#')) {
                        const codeStr = entity.slice(1);
                        const isHex = codeStr.startsWith('x') || codeStr.startsWith('X');
                        const codePoint = isHex
                            ? parseInt(codeStr.slice(1), 16)
                            : parseInt(codeStr, 10);
                        if (Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff) {
                            try {
                                return String.fromCodePoint(codePoint);
                            } catch {
                                return match;
                            }
                        }
                    }
                    return match;
                }
            }
        });
};

const extractText = (value: string | { text: string }): string => {
    return typeof value === 'string' ? value : value.text;
};

export interface LimitValidationOptions {
    /** Allow empty string without throwing validation error */
    allowEmpty?: boolean;
    /** Treat input as Telegram HTML and validate length after stripping tags & entities */
    isHtml?: boolean;
    /** Format mode (e.g. 'HTML') */
    parseMode?: 'HTML' | 'entities' | 'plain';
}

/**
 * Validates text length against Telegram Bot API message limit (1–4096 UTF-16 code units).
 * Checks length after entity/HTML parsing as enforced by Telegram Bot API.
 *
 * @param textOrResult - Raw text string, HTML string, or RenderResult object
 * @param options - Validation options (e.g., allowEmpty, isHtml)
 * @throws {TelegramLimitError} if message length violates Telegram limits
 */
export const validateMessageLength = (
    textOrResult: string | { text: string },
    options: LimitValidationOptions = {},
): void => {
    let text = extractText(textOrResult);
    if (options.isHtml || options.parseMode === 'HTML') {
        text = stripTelegramHtml(text);
    }
    const length = text.length; // JS string.length measures UTF-16 code units

    if (length === 0 && !options.allowEmpty) {
        throw new TelegramLimitError(
            `Telegram Bot API limit violation: Message text is empty (minimum ${TELEGRAM_LIMITS.MESSAGE_MIN_LENGTH} character required).`,
            'message',
            length,
            TELEGRAM_LIMITS.MESSAGE_MIN_LENGTH,
        );
    }

    if (length > TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH) {
        const excess = length - TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH;
        throw new TelegramLimitError(
            `Telegram Bot API limit violation: Message text is ${length} UTF-16 code units, which exceeds the limit of ${TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH} characters by ${excess}.`,
            'message',
            length,
            TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH,
        );
    }
};

/**
 * Validates text length against Telegram Bot API media caption limit (0–1024 UTF-16 code units).
 * Checks length after entity/HTML parsing as enforced by Telegram Bot API.
 *
 * @param textOrResult - Raw caption string, HTML string, or RenderResult object
 * @param options - Validation options (e.g., isHtml)
 * @throws {TelegramLimitError} if caption length exceeds 1024 characters
 */
export const validateCaptionLength = (
    textOrResult: string | { text: string },
    options: LimitValidationOptions = {},
): void => {
    let text = extractText(textOrResult);
    if (options.isHtml || options.parseMode === 'HTML') {
        text = stripTelegramHtml(text);
    }
    const length = text.length;

    if (length > TELEGRAM_LIMITS.CAPTION_MAX_LENGTH) {
        const excess = length - TELEGRAM_LIMITS.CAPTION_MAX_LENGTH;
        throw new TelegramLimitError(
            `Telegram Bot API limit violation: Media caption is ${length} UTF-16 code units, which exceeds the limit of ${TELEGRAM_LIMITS.CAPTION_MAX_LENGTH} characters by ${excess}.`,
            'caption',
            length,
            TELEGRAM_LIMITS.CAPTION_MAX_LENGTH,
        );
    }
};
