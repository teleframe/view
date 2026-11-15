/**
 * @fileoverview Comprehensive unit tests for RawHtml component and rawHtml helper.
 * Covers basic rendering, functional invocation, nesting in JSX containers,
 * complex Telegram tags (syntax highlighting, expandable blockquotes, custom emoji,
 * tg-time, deep formatting, mentions), mixed composition, entity extraction, and edge cases.
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Br,
    CodeBlock,
    Each,
    Italic,
    Li,
    Link,
    Paragraph,
    RawHtml,
    rawHtml,
    render,
    renderHtml,
    renderToString,
    Show,
    Ul,
    user,
} from '../lib';

describe('RawHtml - Basic Rendering and Function Signatures', () => {
    test('renders trusted raw HTML string without escaping in JSX', () => {
        const rawContent = '<b>Safe pre-escaped</b> & <i>italic</i>';
        const result = renderToString(<RawHtml html={rawContent} />);
        expect(result).toBe(rawContent);
    });

    test('supports renderHtml alias', () => {
        const result = renderHtml(<RawHtml html="<code>const x = 10;</code>" />);
        expect(result).toBe('<code>const x = 10;</code>');
    });

    test('supports uppercase RawHtml called as a function with object props', () => {
        const result = renderHtml(RawHtml({ html: '<s>strikethrough</s>' }));
        expect(result).toBe('<s>strikethrough</s>');
    });

    test('supports uppercase RawHtml called directly with string argument', () => {
        const result = renderHtml(RawHtml('<u>underlined text</u>'));
        expect(result).toBe('<u>underlined text</u>');
    });

    test('supports lowercase rawHtml helper called with string argument', () => {
        const result = renderHtml(rawHtml('<strong>bold helper</strong>'));
        expect(result).toBe('<strong>bold helper</strong>');
    });

    test('supports lowercase rawHtml helper called with object props', () => {
        const result = renderHtml(rawHtml({ html: '<em>italic helper</em>' }));
        expect(result).toBe('<em>italic helper</em>');
    });

    test('handles empty string gracefully', () => {
        expect(renderToString(<RawHtml html="" />)).toBe('');
        expect(renderToString(rawHtml(''))).toBe('');
    });

    test('handles missing or undefined html prop gracefully without throwing', () => {
        expect(renderToString(RawHtml({} as unknown as { html: string }))).toBe('');
    });
});

describe('RawHtml - Complex Telegram Tags & Formatting', () => {
    test('renders pre-formatted code block with syntax highlighting', () => {
        const highlightedCode =
            '<pre><code class="language-typescript">const answer: number = 42;\nconsole.log(answer);</code></pre>';
        const result = renderToString(<RawHtml html={highlightedCode} />);
        expect(result).toBe(highlightedCode);
    });

    test('renders expandable blockquote with raw HTML', () => {
        const quote =
            '<blockquote expandable>First paragraph of quote\nSecond paragraph</blockquote>';
        const result = renderToString(<RawHtml html={quote} />);
        expect(result).toBe(quote);
    });

    test('renders custom emoji with tg-emoji tag and emoji-id', () => {
        const customEmoji = '<tg-emoji emoji-id="5368324170671202286">🔥</tg-emoji>';
        const result = renderToString(<RawHtml html={customEmoji} />);
        expect(result).toBe(customEmoji);
    });

    test('renders Telegram Bot API 9.0 tg-time tag with unix and format', () => {
        const tgTime = '<tg-time unix="1718000000" format="r">5 minutes ago</tg-time>';
        const result = renderToString(<RawHtml html={tgTime} />);
        expect(result).toBe(tgTime);
    });

    test('renders deeply nested formatting tags intact', () => {
        const deepMarkup =
            '<b><i><u><s><tg-spoiler>deeply nested secret</tg-spoiler></s></u></i></b>';
        const result = renderToString(<RawHtml html={deepMarkup} />);
        expect(result).toBe(deepMarkup);
    });

    test('renders links with query parameters without double-escaping ampersands', () => {
        const link =
            '<a href="https://example.com/search?q=telegram&amp;category=bot">Search Link</a>';
        const result = renderToString(<RawHtml html={link} />);
        expect(result).toBe(link);
    });

    test('renders user mention link with tg://user protocol', () => {
        const mention = '<a href="tg://user?id=123456789">@developer</a>';
        const result = renderToString(<RawHtml html={mention} />);
        expect(result).toBe(mention);
    });
});

describe('RawHtml - Nesting within JSX Containers and Components', () => {
    test('renders inside Paragraph component', () => {
        const element = (
            <Paragraph>
                Prefix <RawHtml html="<b>bold raw</b>" /> and{' '}
                <RawHtml html="<code>code raw</code>" /> suffix.
            </Paragraph>
        );
        expect(renderToString(element)).toBe(
            'Prefix <b>bold raw</b> and <code>code raw</code> suffix.\n\n',
        );
    });

    test('renders inside Blockquote component', () => {
        const element = (
            <Blockquote expandable>
                <RawHtml html="<b>Warning:</b> Service will restart soon." />
            </Blockquote>
        );
        expect(renderToString(element)).toBe(
            '<blockquote expandable><b>Warning:</b> Service will restart soon.</blockquote>',
        );
    });

    test('renders inside Ul and Li list components', () => {
        const element = (
            <Ul>
                <Li>
                    <RawHtml html="<code>item_1</code>: enabled" />
                </Li>
                <Li>
                    <RawHtml html="<code>item_2</code>: <b>disabled</b>" />
                </Li>
            </Ul>
        );
        expect(renderToString(element)).toBe(
            '• <code>item_1</code>: enabled\n• <code>item_2</code>: <b>disabled</b>\n',
        );
    });

    test('renders inside Show conditional component', () => {
        const visibleElement = (
            <Show when={true} fallback={<RawHtml html="<i>Fallback</i>" />}>
                <RawHtml html="<b>Visible raw content</b>" />
            </Show>
        );
        expect(renderToString(visibleElement)).toBe('<b>Visible raw content</b>');

        const fallbackElement = (
            <Show when={false} fallback={<RawHtml html="<i>Fallback content</i>" />}>
                <RawHtml html="<b>Hidden content</b>" />
            </Show>
        );
        expect(renderToString(fallbackElement)).toBe('<i>Fallback content</i>');
    });

    test('renders inside Each collection iterator', () => {
        const tags = ['typescript', 'bun', 'telegram'];
        const element = (
            <Each items={tags} separator=" | ">
                {(tag: string) => <RawHtml html={`<code>#${tag}</code>`} />}
            </Each>
        );
        expect(renderToString(element)).toBe(
            '<code>#typescript</code> | <code>#bun</code> | <code>#telegram</code>',
        );
    });
});

describe('RawHtml - Mixed Composition with JSX & Functional Helpers', () => {
    test('seamlessly mixes JSX components, functional helpers, and RawHtml', () => {
        const element = (
            <>
                <Bold>System Notification</Bold>
                <Br />
                {user(987654321, 'Admin')}
                {' executed payload:'}
                <Br />
                {rawHtml('<pre><code class="language-json">{"ok": true}</code></pre>')}
                <Br />
                <Italic>Status: </Italic>
                <RawHtml html="<b>ONLINE</b>" />
            </>
        );

        const expected = [
            '<b>System Notification</b>',
            '\n',
            '<a href="tg://user?id=987654321">Admin</a>',
            ' executed payload:',
            '\n',
            '<pre><code class="language-json">{"ok": true}</code></pre>',
            '\n',
            '<i>Status: </i>',
            '<b>ONLINE</b>',
        ].join('');

        expect(renderToString(element)).toBe(expected);
    });
});

describe('RawHtml - HTML Entities Preservation', () => {
    test('does not double escape pre-sanitized HTML entities', () => {
        const preEscaped = 'Math: 1 &lt; 2 &amp;&amp; 3 &gt; 2; Quote: &quot;hello&quot;';
        const result = renderToString(<RawHtml html={preEscaped} />);
        expect(result).toBe(preEscaped);
        expect(result).not.toContain('&amp;lt;');
        expect(result).not.toContain('&amp;amp;');
    });
});

describe('RawHtml - Multiline Template Strings', () => {
    test('preserves whitespace and indentation in multiline raw HTML', () => {
        const multiline = `
<pre><code class="language-python">def hello():
    print("Hello, world!")
</code></pre>`.trim();

        const result = renderToString(<RawHtml html={multiline} />);
        expect(result).toBe(multiline);
    });
});

describe('RawHtml - Entity Compilation Mode (render())', () => {
    test('strips HTML tags to maintain plain text stream when compiling entities', () => {
        const element = (
            <>
                <Bold>Header</Bold>
                <Br />
                <RawHtml html="Plain text with <i>nested</i> and <code>inline</code> tags." />
            </>
        );

        const result = render(element);

        // Plain text should contain the stripped text without HTML tags
        expect(result.text).toBe('Header\nPlain text with nested and inline tags.');

        // Entities should correctly point to Header bold entity without offset corruption
        expect(result.entities).toHaveLength(1);
        expect(result.entities[0]).toEqual({
            type: 'bold',
            offset: 0,
            length: 6,
        });
    });

    test('strips complex tags like blockquote, pre and code in entity mode', () => {
        const result = render(
            <RawHtml html='<blockquote expandable>Quoted content</blockquote> and <pre><code class="language-js">let a = 1;</code></pre>' />,
        );
        expect(result.text).toBe('Quoted content and let a = 1;');
        expect(result.entities).toEqual([]);
    });
});
