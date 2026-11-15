/**
 * @fileoverview HTML escaping, integer normalization, and URL validation for Telegram formatting
 * @module @teleframe/view/native/sanitizer/escape
 */

/**
 * Escapes characters with special meaning in Telegram HTML: &, <, >
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
 * Error thrown when a security validation rule fails (prohibited URL scheme, unsafe user ID, etc.)
 */
export class TelegramSecurityError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TelegramSecurityError';
    }
}

/**
 * Normalizes and clamps integer parameters (count, length, indent, spacing)
 * to safe, finite bounds to prevent RangeError and memory exhaustion.
 */
export const normalizeInteger = (
    value: unknown,
    defaultValue: number,
    min: number = 0,
    max: number = 4096,
): number => {
    if (value === undefined || value === null) return defaultValue;
    const num = Number(value);
    if (!Number.isFinite(num) || Number.isNaN(num)) return defaultValue;
    const intVal = Math.trunc(num);
    if (intVal < min) return min;
    if (intVal > max) return max;
    return intVal;
};

/**
 * Whitelist of URL schemes supported by Telegram Bot API.
 */
export const ALLOWED_URL_SCHEMES = ['http:', 'https:', 'tg:', 'mailto:', 'tel:'];

/**
 * Validates whether a URL is secure and compliant with Telegram Bot API.
 */
export const isValidUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();

    if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
        return false;
    }

    if (/^tg:\/\//i.test(trimmed)) {
        return true;
    }

    try {
        const parsed = new URL(trimmed);
        return ALLOWED_URL_SCHEMES.includes(parsed.protocol.toLowerCase());
    } catch {
        return false;
    }
};
