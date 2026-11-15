/**
 * @fileoverview Formatted Date & Time format aliases, validation, and normalization for Telegram `<tg-time>` tag
 * @module @telegram-markup/native/tags/time
 */

/**
 * Human-readable aliases mapped to Telegram Bot API raw time format strings:
 * Regex pattern: `r|w?[dD]?[tT]?`
 */
export const TIME_FORMAT_ALIASES = {
    // Relative ("5 minutes ago" / "in 2 hours")
    relative: 'r',
    rel: 'r',
    ago: 'r',

    // Time
    time: 't',
    'time-short': 't',
    'short-time': 't',
    'time-long': 'T',
    'long-time': 'T',
    'time-seconds': 'T',

    // Date
    date: 'd',
    'date-short': 'd',
    'short-date': 'd',
    'date-long': 'D',
    'long-date': 'D',
    'date-full': 'D',

    // Weekday
    weekday: 'w',
    day: 'w',
    'day-of-week': 'w',

    // Combinations
    datetime: 'dt',
    'date-time': 'dt',
    short: 'dt',
    'short-datetime': 'dt',

    'date-time-long': 'dT',
    'long-time-date': 'dT',

    'date-long-time': 'Dt',
    'long-date-time': 'Dt',
    medium: 'Dt',

    'date-long-time-long': 'DT',
    'long-datetime': 'DT',

    'weekday-date': 'wd',
    'weekday-date-long': 'wD',
    'weekday-date-time': 'wdt',
    'weekday-date-long-time': 'wDt',
    'weekday-date-long-time-long': 'wDT',
    full: 'wDT',
} as const;

export type TimeFormatAlias = keyof typeof TIME_FORMAT_ALIASES;

/**
 * Exact raw format string accepted by Telegram Bot API for `<tg-time>`.
 * Pattern: `r|w?[dD]?[tT]?`
 */
export type TelegramRawTimeFormat =
    | 'r'
    | 'w'
    | 'd'
    | 'D'
    | 't'
    | 'T'
    | 'dt'
    | 'dT'
    | 'Dt'
    | 'DT'
    | 'wd'
    | 'wD'
    | 'wdt'
    | 'wdT'
    | 'wDt'
    | 'wDT';

/**
 * Strict union of supported time formats: human-readable alias or Telegram raw format string.
 */
export type TimeFormat = TimeFormatAlias | TelegramRawTimeFormat;

/**
 * Regular expression strictly enforcing Telegram Bot API date-time format rule:
 * Must be 'r' (relative) OR an optional 'w' followed by optional 'd'/'D' followed by optional 't'/'T'.
 * 'r' CANNOT be combined with any other character.
 */
export const TELEGRAM_TIME_FORMAT_REGEX = /^(r|w?[dD]?[tT]?)$/;

/**
 * Normalizes a time format alias to the exact Telegram Bot API raw format string
 * and strictly validates that it conforms to Telegram rules.
 *
 * @param format - Alias or raw format string
 * @returns Normalized raw format string or undefined if not provided
 * @throws {Error} if format is invalid
 */
export const normalizeTimeFormat = (format?: string): TelegramRawTimeFormat | undefined => {
    if (!format) return undefined;

    let raw = format;
    // Strictly verify own property to prevent prototype pollution / prototype property hits
    if (Object.prototype.hasOwnProperty.call(TIME_FORMAT_ALIASES, format)) {
        raw = TIME_FORMAT_ALIASES[format as TimeFormatAlias];
    }

    if (!TELEGRAM_TIME_FORMAT_REGEX.test(raw)) {
        throw new Error(
            `[Telegram Markup] Invalid time format: "${format}". Telegram Bot API only accepts formats matching regex "r|w?[dD]?[tT]?" (or valid aliases).`,
        );
    }

    return raw as TelegramRawTimeFormat;
};

/**
 * Normalizes Date instance, seconds, or milliseconds into an integer Unix timestamp in seconds.
 *
 * @param input - Date, number (seconds or milliseconds), string, or bigint
 * @returns Unix timestamp in seconds (integer)
 * @throws {Error} for Invalid Date, NaN, negative timestamps, or out-of-range values
 */
export const normalizeTimestamp = (input: unknown): number => {
    if (input === null || input === undefined) {
        throw new Error(
            '[Telegram Markup] Missing timestamp: Time component requires a Date instance or unix timestamp.',
        );
    }

    let timestamp: number;

    if (input instanceof Date) {
        const time = input.getTime();
        if (isNaN(time)) {
            throw new Error('[Telegram Markup] Invalid Date instance passed to Time component.');
        }
        timestamp = Math.floor(time / 1000);
    } else if (typeof input === 'bigint') {
        timestamp = Number(input);
    } else if (typeof input === 'string') {
        const parsed = Number(input);
        if (isNaN(parsed)) {
            throw new Error(
                `[Telegram Markup] Non-numeric timestamp string passed to Time: "${input}".`,
            );
        }
        timestamp = parsed;
    } else if (typeof input === 'number') {
        if (isNaN(input)) {
            throw new Error('[Telegram Markup] NaN timestamp passed to Time component.');
        }
        timestamp = input;
    } else {
        throw new Error(`[Telegram Markup] Unsupported timestamp type: ${typeof input}.`);
    }

    if (timestamp < 0) {
        throw new Error(
            `[Telegram Markup] Negative timestamps are not supported by Telegram: ${timestamp}.`,
        );
    }

    // Auto-detect milliseconds (timestamps > 1e11 are after year 5138 in seconds, or year 1973 in ms)
    if (timestamp > 1e11) {
        timestamp = Math.floor(timestamp / 1000);
    } else {
        timestamp = Math.floor(timestamp);
    }

    // Upper limit check (year 9999)
    if (timestamp > 253402300799) {
        throw new Error(`[Telegram Markup] Timestamp out of supported range: ${timestamp}.`);
    }

    return timestamp;
};
