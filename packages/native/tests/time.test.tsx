/**
 * @fileoverview Unit tests for Time component and date/time format normalization
 */

import { describe, expect, test } from 'bun:test';
import { Time } from '../lib/components/time';
import { renderToString } from '../lib/render';
import { normalizeTimeFormat } from '../lib/tags/time';

describe('Time Format Normalization', () => {
    test('normalizes relative aliases to r', () => {
        expect(normalizeTimeFormat('relative')).toBe('r');
        expect(normalizeTimeFormat('rel')).toBe('r');
        expect(normalizeTimeFormat('ago')).toBe('r');
    });

    test('normalizes date and time aliases', () => {
        expect(normalizeTimeFormat('date')).toBe('d');
        expect(normalizeTimeFormat('date-long')).toBe('D');
        expect(normalizeTimeFormat('time')).toBe('t');
        expect(normalizeTimeFormat('time-long')).toBe('T');
    });

    test('normalizes composite aliases', () => {
        expect(normalizeTimeFormat('datetime')).toBe('dt');
        expect(normalizeTimeFormat('medium')).toBe('Dt');
        expect(normalizeTimeFormat('full')).toBe('wDT');
    });

    test('passes through raw Telegram format strings unchanged', () => {
        expect(normalizeTimeFormat('wDT')).toBe('wDT');
        expect(normalizeTimeFormat('r')).toBe('r');
    });
});

describe('Time Component Rendering', () => {
    test('renders tg-time tag with normalized format', () => {
        const el = <Time unix={1718000000} format="relative" />;
        const output = renderToString(el);
        expect(output).toContain('<tg-time unix="1718000000" format="r">');
        expect(output).toContain('</tg-time>');
    });

    test('derives format from boolean flags', () => {
        const date = new Date(1718000000 * 1000);
        const el = <Time date={date} weekday dateLong timeShort />;
        expect(renderToString(el)).toContain('format="wDt"');
    });

    test('prioritizes relative flag over other flags', () => {
        const el = <Time unix={1718000000} relative />;
        expect(renderToString(el)).toContain('format="r"');
    });

    test('uses custom children as fallback when provided', () => {
        const el = (
            <Time unix={1718000000} format="r">
                Just now
            </Time>
        );
        expect(renderToString(el)).toBe('<tg-time unix="1718000000" format="r">Just now</tg-time>');
    });

    test('validates intrinsic tg-time values and normalizes timestamps', () => {
        expect(
            renderToString(
                <tg-time unix={1718000000123} format="relative">
                    Now
                </tg-time>,
            ),
        ).toBe('<tg-time unix="1718000000" format="r">Now</tg-time>');
        for (const unix of [NaN, Infinity, -1, 'not-a-number']) {
            expect(() => renderToString(<tg-time unix={unix as number} />)).toThrow();
        }
        expect(() =>
            renderToString(<tg-time unix={1718000000} format={'invalid' as any} />),
        ).toThrow();
    });
});
