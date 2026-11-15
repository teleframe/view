/**
 * @fileoverview Unit tests for Telegram Bot API message and caption length limits
 */

import { describe, expect, test } from 'bun:test';
import {
    render,
    renderToString,
    TELEGRAM_LIMITS,
    TelegramLimitError,
    validateCaptionLength,
    validateMessageLength,
} from '../lib';

describe('Telegram Limits Validation', () => {
    test('throws TelegramLimitError when message text is empty', () => {
        expect(() => validateMessageLength('')).toThrow(TelegramLimitError);

        try {
            validateMessageLength('');
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramLimitError);
            expect(err.limitType).toBe('message');
            expect(err.actualLength).toBe(0);
        }

        // Allow empty when explicitly requested
        expect(() => validateMessageLength('', { allowEmpty: true })).not.toThrow();
    });

    test('validates message text within 1–4096 characters', () => {
        expect(() => validateMessageLength('Hello')).not.toThrow();
        expect(() => validateMessageLength('a'.repeat(4096))).not.toThrow();

        // 4097 characters should throw
        expect(() => validateMessageLength('a'.repeat(4097))).toThrow(TelegramLimitError);

        try {
            validateMessageLength('a'.repeat(4100));
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramLimitError);
            expect(err.actualLength).toBe(4100);
            expect(err.limitLength).toBe(TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH);
            expect(err.message).toContain('exceeds the limit of 4096 characters by 4');
        }
    });

    test('validates caption length within 0–1024 characters', () => {
        expect(() => validateCaptionLength('')).not.toThrow();
        expect(() => validateCaptionLength('Photo caption')).not.toThrow();
        expect(() => validateCaptionLength('c'.repeat(1024))).not.toThrow();

        // 1025 characters should throw
        expect(() => validateCaptionLength('c'.repeat(1025))).toThrow(TelegramLimitError);

        try {
            validateCaptionLength('c'.repeat(1050));
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramLimitError);
            expect(err.limitType).toBe('caption');
            expect(err.actualLength).toBe(1050);
            expect(err.message).toContain('exceeds the limit of 1024 characters by 26');
        }
    });

    test('integrates with render() validate option', () => {
        // Valid message
        expect(() => render('Valid message', { validate: 'message' })).not.toThrow();

        // Empty message validation error
        expect(() => render('', { validate: 'message' })).toThrow(TelegramLimitError);

        // Exceeding caption validation error
        expect(() => render('x'.repeat(1030), { validate: 'caption' })).toThrow(TelegramLimitError);
    });

    test('integrates with renderToString() validate option', () => {
        expect(() => renderToString('<b>Short</b>', { validate: 'message' })).not.toThrow();

        expect(() =>
            renderToString('<b>' + 'x'.repeat(4100) + '</b>', { validate: 'message' }),
        ).toThrow(TelegramLimitError);
    });

    test('validates HTML length based on parsed text length rather than raw HTML markup length', () => {
        // Raw HTML string length is 4090 + 7 (<b></b>) = 4097 (> 4096).
        // But Telegram calculates text length after entity/HTML parsing, which is 4090 (<= 4096).
        // This MUST pass without throwing!
        const markupWithTags = <b>{'a'.repeat(4090)}</b>;
        expect(() => renderToString(markupWithTags, { validate: 'message' })).not.toThrow();

        // Caption with long URL: raw HTML is > 1050 chars, but text is only 13 chars.
        // Telegram allows up to 1024 characters of caption text.
        const longUrl = 'https://example.com/' + 'p'.repeat(1050);
        const captionMarkup = <a href={longUrl}>Short caption</a>;
        expect(() => renderToString(captionMarkup, { validate: 'caption' })).not.toThrow();

        // HTML entities like &amp; should count as 1 character, not 5
        const entitiesMarkup = <b>{'&'.repeat(4090)}</b>;
        // Serialized HTML contains &amp; repeated 4090 times = 20,450 characters!
        // But parsed text length is 4090 <= 4096, so it must pass!
        expect(() => renderToString(entitiesMarkup, { validate: 'message' })).not.toThrow();
    });
});
