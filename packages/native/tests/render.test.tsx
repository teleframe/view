/**
 * @fileoverview Unit tests for HTML escaping and string rendering engine
 */

import { describe, expect, test } from 'bun:test';
import { escapeAttr, escapeHtml, render, renderHTML, renderToString } from '../lib/render';

describe('HTML Escaping Utilities', () => {
    test('escapeHtml escapes &, <, and >', () => {
        expect(escapeHtml('Hello & Welcome <world>')).toBe('Hello &amp; Welcome &lt;world&gt;');
        expect(escapeHtml('1 < 2 && 4 > 3')).toBe('1 &lt; 2 &amp;&amp; 4 &gt; 3');
        expect(escapeHtml(123)).toBe('123');
    });

    test('escapeAttr escapes quotes along with HTML entities', () => {
        expect(escapeAttr('hello "world" & <test>')).toBe(
            'hello &quot;world&quot; &amp; &lt;test&gt;',
        );
    });
});

describe('renderToString Core Serializer', () => {
    test('renders primitive values', () => {
        expect(renderToString('Plain text')).toBe('Plain text');
        expect(renderToString(42)).toBe('42');
        expect(renderToString(null)).toBe('');
        expect(renderToString(undefined)).toBe('');
        expect(renderToString(false)).toBe('');
        expect(renderToString(true)).toBe('');
    });

    test('escapes raw strings passed to elements', () => {
        const el = <b>{'Tom & Jerry <cartoon>'}</b>;
        expect(renderToString(el)).toBe('<b>Tom &amp; Jerry &lt;cartoon&gt;</b>');
    });

    test('renders arrays and nested children', () => {
        const el = (
            <blockquote>
                <b>Part 1</b>
                <i>Part 2</i>
            </blockquote>
        );
        expect(renderToString(el)).toBe('<blockquote><b>Part 1</b><i>Part 2</i></blockquote>');
    });

    test('renders boolean attributes properly', () => {
        const el = <blockquote expandable>Collapsible quote</blockquote>;
        expect(renderToString(el)).toBe('<blockquote expandable>Collapsible quote</blockquote>');
    });

    test('maps className to class attribute', () => {
        const el = <span className="tg-spoiler">Hidden</span>;
        expect(renderToString(el)).toBe('<span class="tg-spoiler">Hidden</span>');
    });

    test('unwraps bare span without class="tg-spoiler" to prevent Telegram 400 Bad Request', () => {
        const el = <span>Plain wrapper content</span>;
        expect(renderToString(el)).toBe('Plain wrapper content');
    });

    test('renderHTML is alias of renderToString', () => {
        expect(renderHTML).toBe(renderToString);
    });
});
