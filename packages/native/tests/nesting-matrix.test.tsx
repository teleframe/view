/**
 * @fileoverview Unit tests for full matrix of valid nested entity combinations.
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Code,
    CodeBlock,
    Emoji,
    Italic,
    Link,
    Pre,
    render,
    renderToString,
    Spoiler,
    Strike,
    Time,
    Underline,
    User,
} from '../lib';

describe('Telegram Nesting Validation - Valid Combinations Matrix', () => {
    test('renders full matrix of valid combinations across all supported entity types', () => {
        const validMatrix = [
            // Deep formatting cascade
            {
                name: 'All 5 formatting tags combined',
                tree: (
                    <Bold>
                        <Italic>
                            <Underline>
                                <Strike>
                                    <Spoiler>Deep text</Spoiler>
                                </Strike>
                            </Underline>
                        </Italic>
                    </Bold>
                ),
                expectedTag: '<b><i><u><s><tg-spoiler>Deep text</tg-spoiler></s></u></i></b>',
                expectedEntityCount: 5,
            },
            // Blockquote with inline code and pre
            {
                name: 'Blockquote containing inline code',
                tree: (
                    <Blockquote>
                        Inline: <Code>npm install</Code>
                    </Blockquote>
                ),
                expectedTag: '<blockquote>Inline: <code>npm install</code></blockquote>',
                expectedEntityCount: 2,
            },
            {
                name: 'Blockquote containing Pre and CodeBlock',
                tree: (
                    <Blockquote>
                        <Pre>code block</Pre>
                        <CodeBlock language="python">print(1)</CodeBlock>
                    </Blockquote>
                ),
                expectedTag:
                    '<blockquote><pre>code block</pre><pre><code class="language-python">print(1)</code></pre></blockquote>',
                expectedEntityCount: 3,
            },
            {
                name: 'Expandable Blockquote with multiple formatting tags',
                tree: (
                    <Blockquote expandable>
                        <Bold>Title</Bold>
                        <Italic>Description</Italic>
                        <Link href="https://telegram.org">Docs</Link>
                    </Blockquote>
                ),
                expectedTag:
                    '<blockquote expandable><b>Title</b><i>Description</i><a href="https://telegram.org">Docs</a></blockquote>',
                expectedEntityCount: 4,
            },
            // Link containing formatting
            {
                name: 'Link containing Bold, Italic and Underline',
                tree: (
                    <Link href="https://example.com">
                        <Bold>
                            <Italic>
                                <Underline>Clickable</Underline>
                            </Italic>
                        </Bold>
                    </Link>
                ),
                expectedTag: '<a href="https://example.com"><b><i><u>Clickable</u></i></b></a>',
                expectedEntityCount: 4,
            },
            // Formatting containing Link
            {
                name: 'Bold containing Link and Emoji',
                tree: (
                    <Bold>
                        <Link href="https://example.com">Website</Link> <Emoji id="54321">🚀</Emoji>
                    </Bold>
                ),
                expectedTag:
                    '<b><a href="https://example.com">Website</a> <tg-emoji emoji-id="54321">🚀</tg-emoji></b>',
                expectedEntityCount: 3,
            },
            // User mention containing formatting
            {
                name: 'User mention containing Bold text',
                tree: (
                    <User id={2202303388}>
                        <Bold>Шахриёр</Bold>
                    </User>
                ),
                expectedTag: '<a href="tg://user?id=2202303388"><b>Шахриёр</b></a>',
                expectedEntityCount: 2,
            },
            // Bold containing User mention
            {
                name: 'Bold containing User mention',
                tree: (
                    <Bold>
                        Hello <User id={2202303388}>Admin</User>!
                    </Bold>
                ),
                expectedTag: '<b>Hello <a href="tg://user?id=2202303388">Admin</a>!</b>',
                expectedEntityCount: 2,
            },
            // Blockquote containing Time and Emoji
            {
                name: 'Blockquote containing Time and Emoji',
                tree: (
                    <Blockquote>
                        Event <Emoji id="111">📅</Emoji> at{' '}
                        <Time unix={1718000000} format="r">
                            in 2 hours
                        </Time>
                    </Blockquote>
                ),
                expectedTag:
                    '<blockquote>Event <tg-emoji emoji-id="111">📅</tg-emoji> at <tg-time unix="1718000000" format="r">in 2 hours</tg-time></blockquote>',
                expectedEntityCount: 3,
            },
        ];

        for (const item of validMatrix) {
            const html = renderToString(item.tree);
            expect(html).toBe(item.expectedTag);

            const result = render(item.tree);
            expect(result.entities.length).toBe(item.expectedEntityCount);

            // Verify strict nesting containment of all entities
            for (let i = 0; i < result.entities.length; i++) {
                const a = result.entities[i];
                const aEnd = a.offset + a.length;
                for (let j = i + 1; j < result.entities.length; j++) {
                    const b = result.entities[j];
                    const bEnd = b.offset + b.length;
                    if (b.offset < aEnd) {
                        expect(bEnd).toBeLessThanOrEqual(aEnd);
                    }
                }
            }
        }
    });
});
