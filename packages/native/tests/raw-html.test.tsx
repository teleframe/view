/**
 * @fileoverview Unit tests for RawHtml component and rawHtml helper basic rendering
 */

import { describe, expect, test } from 'bun:test';
import { RawHtml, rawHtml, renderHtml, renderToString } from '../lib';

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
