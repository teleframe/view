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

const extractText = (value: string | { text: string }): string => {
    return typeof value === 'string' ? value : value.text;
};

/**
 * Validates text length against Telegram Bot API message limit (1–4096 UTF-16 code units).
 *
 * @param textOrResult - Raw text string or RenderResult object
 * @param options - Validation options (e.g., allowEmpty)
 * @throws {TelegramLimitError} if message length violates Telegram limits
 */
export const validateMessageLength = (
    textOrResult: string | { text: string },
    options: { allowEmpty?: boolean } = {},
): void => {
    const text = extractText(textOrResult);
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
 *
 * @param textOrResult - Raw caption string or RenderResult object
 * @throws {TelegramLimitError} if caption length exceeds 1024 characters
 */
export const validateCaptionLength = (textOrResult: string | { text: string }): void => {
    const text = extractText(textOrResult);
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
