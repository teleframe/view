/**
 * @fileoverview Unit tests for List, Ul, Ol, Li components and numbering utilities
 */

import { describe, expect, test } from 'bun:test';
import { formatNumberMarker, Li, List, Ol, toAlpha, toRoman, Ul } from '../lib/components/list';
import { renderToString } from '../lib/render';

describe('List Utilities', () => {
    test('toRoman converts integers to Roman numerals', () => {
        expect(toRoman(1)).toBe('I');
        expect(toRoman(4)).toBe('IV');
        expect(toRoman(9)).toBe('IX');
        expect(toRoman(14)).toBe('XIV');
        expect(toRoman(42)).toBe('XLII');
    });

    test('toAlpha converts 1-based index to Latin characters', () => {
        expect(toAlpha(1)).toBe('a');
        expect(toAlpha(2)).toBe('b');
        expect(toAlpha(26)).toBe('z');
    });

    test('formatNumberMarker formats with specified style', () => {
        expect(formatNumberMarker(1, 'dot')).toBe('1. ');
        expect(formatNumberMarker(2, 'paren')).toBe('2) ');
        expect(formatNumberMarker(3, 'roman')).toBe('III. ');
        expect(formatNumberMarker(4, 'alpha')).toBe('d. ');
    });
});

describe('List Components Rendering', () => {
    test('renders standard bullet list via Ul', () => {
        const el = (
            <Ul>
                <Li>First</Li>
                <Li>Second</Li>
            </Ul>
        );
        const output = renderToString(el);
        expect(output).toContain('• First\n');
        expect(output).toContain('• Second\n');
    });

    test('renders dash list', () => {
        const el = (
            <Ul bullet="dash">
                <Li>Alpha</Li>
                <Li>Beta</Li>
            </Ul>
        );
        const output = renderToString(el);
        expect(output).toContain('— Alpha\n');
        expect(output).toContain('— Beta\n');
    });

    test('renders ordered list via Ol with start and styles', () => {
        const el = (
            <Ol start={5} numberStyle="paren">
                <Li>Step 5</Li>
                <Li>Step 6</Li>
            </Ol>
        );
        const output = renderToString(el);
        expect(output).toContain('5) Step 5\n');
        expect(output).toContain('6) Step 6\n');
    });

    test('allows individual Li marker overrides', () => {
        const el = (
            <Ul>
                <Li>Standard</Li>
                <Li marker="⭐ ">Starred</Li>
            </Ul>
        );
        const output = renderToString(el);
        expect(output).toContain('• Standard\n');
        expect(output).toContain('⭐ Starred\n');
    });

    test('handles indentation level', () => {
        const el = (
            <List indent={2}>
                <Li>Indented</Li>
            </List>
        );
        const output = renderToString(el);
        expect(output.startsWith('    • Indented')).toBe(true);
    });
});
