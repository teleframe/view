/**
 * @fileoverview Unit tests for intrinsic Telegram HTML tags and JSX transformations
 */

import { describe, expect, test } from 'bun:test';
import { Bold } from '../lib/components';
import { h } from '../lib/jsx-runtime';
import { renderToString } from '../lib/render';

describe('Intrinsic HTML Tags and Transforms', () => {
    test('formats bold variants', () => {
        expect(renderToString(<b>Bold Text</b>)).toBe('<b>Bold Text</b>');
        expect(renderToString(<strong>Strong Text</strong>)).toBe('<strong>Strong Text</strong>');
    });

    test('formats italic variants', () => {
        expect(renderToString(<i>Italic</i>)).toBe('<i>Italic</i>');
        expect(renderToString(<em>Emphasis</em>)).toBe('<em>Emphasis</em>');
    });

    test('formats underline variants', () => {
        expect(renderToString(<u>Underline</u>)).toBe('<u>Underline</u>');
        expect(renderToString(<ins>Insert</ins>)).toBe('<ins>Insert</ins>');
    });

    test('formats strikethrough variants', () => {
        expect(renderToString(<s>Strike</s>)).toBe('<s>Strike</s>');
        expect(renderToString(<strike>Strike</strike>)).toBe('<strike>Strike</strike>');
        expect(renderToString(<del>Delete</del>)).toBe('<del>Delete</del>');
    });

    test('formats spoilers', () => {
        expect(renderToString(<tg-spoiler>Secret</tg-spoiler>)).toBe(
            '<tg-spoiler>Secret</tg-spoiler>',
        );
        expect(renderToString(<span class="tg-spoiler">Secret</span>)).toBe(
            '<span class="tg-spoiler">Secret</span>',
        );
    });

    test('transforms virtual <user id={...}> to tg://user link', () => {
        const el = <user id={123456789}>Alice</user>;
        expect(renderToString(el)).toBe('<a href="tg://user?id=123456789">Alice</a>');
    });

    test('transforms virtual <mono> to <code>', () => {
        const el = <mono>inline_token</mono>;
        expect(renderToString(el)).toBe('<code>inline_token</code>');
    });

    test('transforms <codeblock language="..."> into pre and code with class', () => {
        const el = <codeblock language="typescript">const a = 1;</codeblock>;
        expect(renderToString(el)).toBe(
            '<pre><code class="language-typescript">const a = 1;</code></pre>',
        );
    });

    test('transforms <code language="..."> into pre and code with class', () => {
        const el = <code language="python">{'print("hi")'}</code>;
        expect(renderToString(el)).toBe(
            '<pre><code class="language-python">print("hi")</code></pre>',
        );
    });

    test('transforms <pre language="..."> into pre and code with class', () => {
        const el = <pre language="rust">{'fn main() {}'}</pre>;
        expect(renderToString(el)).toBe(
            '<pre><code class="language-rust">fn main() {}</code></pre>',
        );
    });

    test('renders custom emoji <tg-emoji>', () => {
        const el = <tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>;
        expect(renderToString(el)).toBe('<tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>');
    });

    test('normalizes format alias in <tg-time>', () => {
        const el = (
            <tg-time unix="1718000000" format="relative">
                5 minutes ago
            </tg-time>
        );
        expect(renderToString(el)).toBe(
            '<tg-time unix="1718000000" format="r">5 minutes ago</tg-time>',
        );
    });

    test('renders <br> with count and format', () => {
        expect(renderToString(<br />)).toBe('\n');
        expect(renderToString(<br count={2} />)).toBe('\n\n');
        expect(renderToString(<br count={3} as="br" />)).toBe('<br><br><br>');
    });

    test('renders <hr> horizontal rule', () => {
        expect(renderToString(<hr char="—" length={5} before={1} after={1} />)).toBe('\n—————\n');
    });

    test('renders virtual <p> tag with auto line breaks', () => {
        expect(renderToString(<p>Virtual paragraph</p>)).toBe('Virtual paragraph\n\n');
        expect(renderToString(<p count={1}>Single break</p>)).toBe('Single break\n');
        expect(
            renderToString(
                <p before={2} count={1}>
                    Two before one after
                </p>,
            ),
        ).toBe('\n\nTwo before one after\n');
    });

    test('renders Fragments properly', () => {
        const el = (
            <>
                <b>First</b>
                <i>Second</i>
            </>
        );
        expect(renderToString(el)).toBe('<b>First</b><i>Second</i>');
    });

    test('supports classic JSX factory h function', () => {
        const el1 = h('b', null, 'Hello from h');
        expect(renderToString(el1)).toBe('<b>Hello from h</b>');

        const el2 = h(Bold, { tagName: 'strong' }, 'Strong text');
        expect(renderToString(el2)).toBe('<strong>Strong text</strong>');

        const el3 = h('div', null, h('b', null, 'Nested 1'), h('i', null, 'Nested 2'));
        expect(renderToString(el3)).toBe('<b>Nested 1</b><i>Nested 2</i>');
    });

    test('seamlessly embeds functional helpers inside JSX trees', () => {
        const { br, divider, emoji, mono, time, user } = require('../lib');
        const now = new Date('2025-01-01T00:00:00Z');

        const tree = (
            <p>
                Welcome, {user(12345, 'Alex')}! {emoji('5368324170671202286', '👍')}
                {br(2)}
                Since: {time(now, 'relative')}
                {divider('—', 10)}
                Token: {mono('auth_tok_xyz')}
            </p>
        );

        const html = renderToString(tree);
        expect(html).toContain('<a href="tg://user?id=12345">Alex</a>');
        expect(html).toContain('<tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>');
        expect(html).toContain('\n\nSince: <tg-time');
        expect(html).toContain('——————————');
        expect(html).toContain('<code>auth_tok_xyz</code>');
    });
});
