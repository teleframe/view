/**
 * @fileoverview Unit tests for Date & Time normalization, validation, and localized fallback
 */

import { describe, expect, test } from 'bun:test';
import { normalizeTimeFormat, normalizeTimestamp, render, renderToString, Time } from '../lib';

describe('Date & Time Normalization (Stage 7)', () => {
    test('normalizes JavaScript Date instance to Unix seconds', () => {
        const date = new Date(1718000000000); // in ms
        const seconds = normalizeTimestamp(date);
        expect(seconds).toBe(1718000000);
    });

    test('preserves second timestamps and normalizes millisecond timestamps', () => {
        // Seconds
        expect(normalizeTimestamp(1718000000)).toBe(1718000000);
        // Milliseconds (> 1e11)
        expect(normalizeTimestamp(1718000000123)).toBe(1718000000);
    });

    test('throws descriptive error on Invalid Date', () => {
        const invalidDate = new Date('not-a-valid-date');
        expect(() => normalizeTimestamp(invalidDate)).toThrow(
            /Invalid Date instance passed to Time component/,
        );
    });

    test('throws descriptive error on negative or non-numeric timestamps', () => {
        expect(() => normalizeTimestamp(-100)).toThrow(
            /Negative timestamps are not supported by Telegram/,
        );
        expect(() => normalizeTimestamp(NaN)).toThrow(/NaN timestamp/);
        expect(() => normalizeTimestamp('not-a-number')).toThrow(/Non-numeric timestamp string/);
    });

    test('normalizes time format aliases only on own properties', () => {
        expect(normalizeTimeFormat('relative')).toBe('r');
        expect(normalizeTimeFormat('full')).toBe('wDT');
        expect(normalizeTimeFormat('short')).toBe('dt');

        // Prototype properties must not be matched as aliases
        expect(() => normalizeTimeFormat('toString')).toThrow(/Invalid time format/);
        expect(() => normalizeTimeFormat('constructor')).toThrow(/Invalid time format/);
    });

    test('validates Telegram raw format string against regex r|w?[dD]?[tT]?', () => {
        // Valid raw formats
        expect(normalizeTimeFormat('r')).toBe('r');
        expect(normalizeTimeFormat('w')).toBe('w');
        expect(normalizeTimeFormat('d')).toBe('d');
        expect(normalizeTimeFormat('D')).toBe('D');
        expect(normalizeTimeFormat('wDT')).toBe('wDT');
        expect(normalizeTimeFormat('wd')).toBe('wd');

        // Invalid raw formats (r cannot be combined with other flags)
        expect(() => normalizeTimeFormat('rw')).toThrow(/Invalid time format/);
        expect(() => normalizeTimeFormat('rD')).toThrow(/Invalid time format/);
        // Random strings
        expect(() => normalizeTimeFormat('xyz')).toThrow(/Invalid time format/);
        expect(() => normalizeTimeFormat('123')).toThrow(/Invalid time format/);
    });

    test('uses identical normalized timestamp in entity and tag', () => {
        const date = new Date(1718000000000);
        const entityResult = render(<Time date={date} format="relative" />);
        expect(entityResult.entities[0]).toMatchObject({
            type: 'date_time',
            unix_time: 1718000000,
            date_time_format: 'r',
        });

        const html = renderToString(<Time date={date} format="relative" />);
        expect(html).toContain('unix="1718000000"');
        expect(html).toContain('format="r"');
    });

    test('supports custom fallback string and generator callback', () => {
        const date = new Date(1718000000000);

        // String fallback
        const resultString = render(
            <Time date={date} fallback="Custom static fallback" format="r" />,
        );
        expect(resultString.text).toBe('Custom static fallback');

        // Callback fallback
        const resultFn = render(
            <Time date={date} fallback={(d) => `Year: ${d.getUTCFullYear()}`} format="r" />,
        );
        expect(resultFn.text).toBe('Year: 2024');
    });

    test('supports configurable locale for fallback string formatting', () => {
        const date = new Date(Date.UTC(2024, 5, 10, 12, 0, 0));
        const htmlDe = renderToString(<Time date={date} locale="de-DE" format="r" />);
        expect(htmlDe).toBeDefined();
        // Fallback text is rendered inside <tg-time>
        expect(htmlDe).toContain('<tg-time unix="1718020800" format="r">');
    });
});
