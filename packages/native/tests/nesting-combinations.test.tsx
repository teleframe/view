/**
 * @fileoverview Unit tests for boundary permitted combinations and identical spans.
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Code,
    Emoji,
    Link,
    Pre,
    render,
    renderToString,
    Time,
    User,
} from '../lib';

describe('Telegram Nesting Validation - Permitted Boundary Combinations', () => {
    test('renders identical boundary permitted combinations for both render and renderToString', () => {
        // 1. Blockquote > Code (identical span)
        const bqCode = (
            <Blockquote>
                <Code>const x = 1;</Code>
            </Blockquote>
        );
        expect(renderToString(bqCode)).toBe('<blockquote><code>const x = 1;</code></blockquote>');
        const bqCodeRes = render(bqCode);
        expect(bqCodeRes.text).toBe('const x = 1;');
        expect(bqCodeRes.entities).toEqual([
            { type: 'blockquote', offset: 0, length: 12 },
            { type: 'code', offset: 0, length: 12 },
        ]);

        // 2. Blockquote > Pre (identical span)
        const bqPre = (
            <Blockquote>
                <Pre>echo "hello"</Pre>
            </Blockquote>
        );
        expect(renderToString(bqPre)).toBe('<blockquote><pre>echo "hello"</pre></blockquote>');
        const bqPreRes = render(bqPre);
        expect(bqPreRes.text).toBe('echo "hello"');
        expect(bqPreRes.entities).toEqual([
            { type: 'blockquote', offset: 0, length: 12 },
            { type: 'pre', offset: 0, length: 12 },
        ]);

        // 3. Blockquote > Emoji (identical span)
        const bqEmoji = (
            <Blockquote>
                <Emoji id="54321">🚀</Emoji>
            </Blockquote>
        );
        expect(renderToString(bqEmoji)).toBe(
            '<blockquote><tg-emoji emoji-id="54321">🚀</tg-emoji></blockquote>',
        );
        const bqEmojiRes = render(bqEmoji);
        expect(bqEmojiRes.text).toBe('🚀');
        expect(bqEmojiRes.entities).toEqual([
            { type: 'blockquote', offset: 0, length: 2 },
            { type: 'custom_emoji', offset: 0, length: 2, custom_emoji_id: '54321' },
        ]);

        // 4. Blockquote > Time (identical span)
        const bqTime = (
            <Blockquote>
                <Time unix={1718000000} format="r">
                    in 5 minutes
                </Time>
            </Blockquote>
        );
        expect(renderToString(bqTime)).toBe(
            '<blockquote><tg-time unix="1718000000" format="r">in 5 minutes</tg-time></blockquote>',
        );
        const bqTimeRes = render(bqTime);
        expect(bqTimeRes.text).toBe('in 5 minutes');
        expect(bqTimeRes.entities).toEqual([
            { type: 'blockquote', offset: 0, length: 12 },
            {
                type: 'date_time',
                offset: 0,
                length: 12,
                unix_time: 1718000000,
                date_time_format: 'r',
            },
        ]);

        // 5. Blockquote > Link (identical span)
        const bqLink = (
            <Blockquote>
                <Link href="https://example.com">Documentation</Link>
            </Blockquote>
        );
        expect(renderToString(bqLink)).toBe(
            '<blockquote><a href="https://example.com">Documentation</a></blockquote>',
        );
        const bqLinkRes = render(bqLink);
        expect(bqLinkRes.text).toBe('Documentation');
        expect(bqLinkRes.entities).toEqual([
            { type: 'blockquote', offset: 0, length: 13 },
            { type: 'text_link', offset: 0, length: 13, url: 'https://example.com' },
        ]);

        // 6. Blockquote > User (identical span)
        const bqUser = (
            <Blockquote>
                <User id={2202303388}>Шахриёр</User>
            </Blockquote>
        );
        expect(renderToString(bqUser)).toBe(
            '<blockquote><a href="tg://user?id=2202303388">Шахриёр</a></blockquote>',
        );
        const bqUserRes = render(bqUser);
        expect(bqUserRes.text).toBe('Шахриёр');
        expect(bqUserRes.entities).toEqual([
            { type: 'blockquote', offset: 0, length: 7 },
            { type: 'text_mention', offset: 0, length: 7, user: { id: 2202303388 } },
        ]);

        // 7. Link > Bold vs Bold > Link (identical span, respects AST nesting depth)
        const linkBold = (
            <Link href="https://example.com">
                <Bold>Click Me</Bold>
            </Link>
        );
        expect(renderToString(linkBold)).toBe('<a href="https://example.com"><b>Click Me</b></a>');
        const linkBoldRes = render(linkBold);
        expect(linkBoldRes.entities).toEqual([
            { type: 'text_link', offset: 0, length: 8, url: 'https://example.com' },
            { type: 'bold', offset: 0, length: 8 },
        ]);

        const boldLink = (
            <Bold>
                <Link href="https://example.com">Click Me</Link>
            </Bold>
        );
        expect(renderToString(boldLink)).toBe('<b><a href="https://example.com">Click Me</a></b>');
        const boldLinkRes = render(boldLink);
        expect(boldLinkRes.entities).toEqual([
            { type: 'bold', offset: 0, length: 8 },
            { type: 'text_link', offset: 0, length: 8, url: 'https://example.com' },
        ]);

        // 8. Deep nesting with identical spans: Blockquote > Link > Bold
        const bqLinkBold = (
            <Blockquote>
                <Link href="https://example.com">
                    <Bold>Super Link</Bold>
                </Link>
            </Blockquote>
        );
        expect(renderToString(bqLinkBold)).toBe(
            '<blockquote><a href="https://example.com"><b>Super Link</b></a></blockquote>',
        );
        const bqLinkBoldRes = render(bqLinkBold);
        expect(bqLinkBoldRes.entities).toEqual([
            { type: 'blockquote', offset: 0, length: 10 },
            { type: 'text_link', offset: 0, length: 10, url: 'https://example.com' },
            { type: 'bold', offset: 0, length: 10 },
        ]);
    });
});
