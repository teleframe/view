/**
 * @fileoverview Unit tests for basic typography and layout components
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Br,
    Break,
    Code,
    CodeBlock,
    Divider,
    Emoji,
    Hr,
    Italic,
    Link,
    Mono,
    NewLine,
    P,
    Paragraph,
    Pre,
    Spoiler,
    Strike,
    Strikethrough,
    Underline,
    User,
} from '../lib/components';
import { renderToString } from '../lib/render';

describe('Typography Components', () => {
    test('Bold and variations', () => {
        expect(renderToString(<Bold>Hello</Bold>)).toBe('<b>Hello</b>');
        expect(renderToString(<Bold tagName="strong">Hello</Bold>)).toBe('<strong>Hello</strong>');
    });

    test('Italic and variations', () => {
        expect(renderToString(<Italic>Hello</Italic>)).toBe('<i>Hello</i>');
        expect(renderToString(<Italic tagName="em">Hello</Italic>)).toBe('<em>Hello</em>');
    });

    test('Underline and variations', () => {
        expect(renderToString(<Underline>Hello</Underline>)).toBe('<u>Hello</u>');
        expect(renderToString(<Underline tagName="ins">Hello</Underline>)).toBe('<ins>Hello</ins>');
    });

    test('Strike and variations', () => {
        expect(renderToString(<Strike>Hello</Strike>)).toBe('<s>Hello</s>');
        expect(renderToString(<Strikethrough tagName="strike">Hello</Strikethrough>)).toBe(
            '<strike>Hello</strike>',
        );
        expect(renderToString(<Strikethrough tagName="del">Hello</Strikethrough>)).toBe(
            '<del>Hello</del>',
        );
    });

    test('Spoiler and variations', () => {
        expect(renderToString(<Spoiler>Hidden</Spoiler>)).toBe('<tg-spoiler>Hidden</tg-spoiler>');
        expect(renderToString(<Spoiler tagName="span">Hidden</Spoiler>)).toBe(
            '<span class="tg-spoiler">Hidden</span>',
        );
    });

    test('Link and User components', () => {
        expect(renderToString(<Link href="https://example.com">Site</Link>)).toBe(
            '<a href="https://example.com">Site</a>',
        );
        expect(renderToString(<Link userId={12345}>Profile</Link>)).toBe(
            '<a href="tg://user?id=12345">Profile</a>',
        );
        expect(renderToString(<User id="999">User 999</User>)).toBe(
            '<a href="tg://user?id=999">User 999</a>',
        );
    });

    test('Emoji component', () => {
        expect(renderToString(<Emoji id="12345">🔥</Emoji>)).toBe(
            '<tg-emoji emoji-id="12345">🔥</tg-emoji>',
        );
    });

    test('Mono, Code, CodeBlock, and Pre components', () => {
        expect(renderToString(<Mono>token</Mono>)).toBe('<code>token</code>');
        expect(renderToString(<Code>const x = 1;</Code>)).toBe('<code>const x = 1;</code>');
        expect(renderToString(<CodeBlock language="ts">let y = 2;</CodeBlock>)).toBe(
            '<pre><code class="language-ts">let y = 2;</code></pre>',
        );
        expect(renderToString(<Pre>formatted</Pre>)).toBe('<pre>formatted</pre>');
    });

    test('Blockquote component', () => {
        expect(renderToString(<Blockquote>Quote</Blockquote>)).toBe(
            '<blockquote>Quote</blockquote>',
        );
        expect(renderToString(<Blockquote expandable>Expanded</Blockquote>)).toBe(
            '<blockquote expandable>Expanded</blockquote>',
        );
    });

    test('Br, Break, and NewLine components', () => {
        expect(renderToString(<Br />)).toBe('\n');
        expect(renderToString(<Break count={2} />)).toBe('\n\n');
        expect(renderToString(<NewLine lines={3} />)).toBe('\n\n\n');
    });

    test('Divider and Hr components', () => {
        expect(renderToString(<Divider />)).toBe('\n————————————————————\n');
        expect(renderToString(<Hr char="=" length={5} before={0} after={1} />)).toBe('=====\n');
    });

    test('Paragraph and P components', () => {
        expect(renderToString(<Paragraph>First paragraph</Paragraph>)).toBe('First paragraph\n\n');
        expect(renderToString(<P>Shorthand paragraph</P>)).toBe('Shorthand paragraph\n\n');
        expect(renderToString(<Paragraph spacing={1}>Single newline</Paragraph>)).toBe(
            'Single newline\n',
        );
        expect(renderToString(<Paragraph lines={3}>Triple newline</Paragraph>)).toBe(
            'Triple newline\n\n\n',
        );
        expect(
            renderToString(
                <Paragraph before={1} after={1}>
                    Padded paragraph
                </Paragraph>,
            ),
        ).toBe('\nPadded paragraph\n');
        expect(renderToString(<Paragraph after={0}>No trailing</Paragraph>)).toBe('No trailing');
    });
});
