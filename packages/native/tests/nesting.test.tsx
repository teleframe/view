/**
 * @fileoverview Unit tests for Telegram Bot API nesting rules validation
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
    TelegramNestingError,
    Time,
    Underline,
    User,
} from '../lib';

describe('Telegram Nesting Validation (Runtime)', () => {
    test('throws TelegramNestingError when nesting blockquote inside blockquote', () => {
        const invalidTree = (
            <Blockquote>
                Outer
                <Blockquote>Inner forbidden</Blockquote>
            </Blockquote>
        );

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);

        try {
            render(invalidTree);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('blockquote');
            expect(err.childTag).toBe('blockquote');
            expect(err.path).toContain('blockquote > blockquote');
        }
    });

    test('throws TelegramNestingError when nesting formatting tags inside inline code', () => {
        const invalidTree = <Code>Text with {(<Bold>bold</Bold>) as any} inside</Code>;

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);

        try {
            render(invalidTree);
        } catch (err: any) {
            expect(err.parentTag).toBe('code');
            expect(err.childTag).toBe('b');
        }
    });

    test('throws TelegramNestingError when nesting blockquote or formatting inside pre', () => {
        const invalidTree = <Pre>{(<Blockquote>Forbidden inside pre</Blockquote>) as any}</Pre>;

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);
    });

    test('allows <code> inside <pre> for language syntax highlighting', () => {
        const validTree = (
            <Pre>
                <code class="language-typescript">const answer = 42;</code>
            </Pre>
        );

        expect(() => renderToString(validTree)).not.toThrow();
        expect(() => render(validTree)).not.toThrow();
    });

    test('throws TelegramNestingError when nesting links', () => {
        const invalidTree = (
            <Link href="https://example.com">
                Outer {(<Link href="https://inner.com">Inner</Link>) as any}
            </Link>
        );

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError when nesting tags inside custom emoji', () => {
        const invalidTree = <Emoji id="12345">{(<Bold>👍</Bold>) as any}</Emoji>;

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError when nesting tags inside time fallback', () => {
        const invalidTree = (
            <Time unix={1718000000} format="r">
                {(<Italic>5 minutes ago</Italic>) as any}
            </Time>
        );

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError on indirect blockquote nesting', () => {
        const invalidTree = (
            <Blockquote>
                <Bold>
                    <Italic>
                        <Blockquote>Indirectly nested</Blockquote>
                    </Italic>
                </Bold>
            </Blockquote>
        );

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError when nesting inside expandable blockquote', () => {
        const invalidTree = (
            <Blockquote expandable>
                Outer
                <Blockquote>Inner</Blockquote>
            </Blockquote>
        );

        expect(() => renderToString(invalidTree)).toThrow(TelegramNestingError);
        expect(() => render(invalidTree)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError on indirect link nesting and User combinations', () => {
        const indirectLink = (
            <Link href="https://outer.com">
                <Bold>
                    <Link href="https://inner.com">Inner link</Link>
                </Bold>
            </Link>
        );
        expect(() => renderToString(indirectLink)).toThrow(TelegramNestingError);
        expect(() => render(indirectLink)).toThrow(TelegramNestingError);

        const linkInsideUser = (
            <User id={123456}>{(<Link href="https://example.com">Site</Link>) as any}</User>
        );
        expect(() => renderToString(linkInsideUser)).toThrow(TelegramNestingError);
        expect(() => render(linkInsideUser)).toThrow(TelegramNestingError);

        const userInsideLink = (
            <Link href="https://example.com">{(<User id={123456}>Shah</User>) as any}</Link>
        );
        expect(() => renderToString(userInsideLink)).toThrow(TelegramNestingError);
        expect(() => render(userInsideLink)).toThrow(TelegramNestingError);

        const userInsideUser = <User id={123456}>{(<User id={654321}>Friend</User>) as any}</User>;
        expect(() => renderToString(userInsideUser)).toThrow(TelegramNestingError);
        expect(() => render(userInsideUser)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError when nesting Time inside Link or User for both render and renderToString', () => {
        const linkWithTime = (
            <Link href="https://example.com">
                {
                    (
                        <Time unix={1718000000} format="r">
                            in 5 minutes
                        </Time>
                    ) as any
                }
            </Link>
        );

        expect(() => renderToString(linkWithTime)).toThrow(TelegramNestingError);
        expect(() => render(linkWithTime)).toThrow(TelegramNestingError);

        try {
            render(linkWithTime);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('a');
            expect(err.childTag).toBe('tg-time');
            expect(err.path).toBe('a > tg-time');
        }

        // Indirect nesting: Link > Bold > Time
        const indirectLinkTime = (
            <Link href="https://example.com">
                <Bold>
                    {
                        (
                            <Time unix={1718000000} format="r">
                                soon
                            </Time>
                        ) as any
                    }
                </Bold>
            </Link>
        );
        expect(() => renderToString(indirectLinkTime)).toThrow(TelegramNestingError);
        expect(() => render(indirectLinkTime)).toThrow(TelegramNestingError);

        // User mention containing Time
        const userWithTime = (
            <User id={2202303388}>
                {
                    (
                        <Time unix={1718000000} format="r">
                            now
                        </Time>
                    ) as any
                }
            </User>
        );
        expect(() => renderToString(userWithTime)).toThrow(TelegramNestingError);
        expect(() => render(userWithTime)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError for incompatible entity children inside Link (Code, Pre, Blockquote, Emoji)', () => {
        const forbiddenInsideLink = [
            <Code>const x = 1;</Code>,
            <Pre>code block</Pre>,
            <Blockquote>quote</Blockquote>,
            <Emoji id="12345">👍</Emoji>,
        ];

        for (const child of forbiddenInsideLink) {
            const tree = <Link href="https://example.com">{child as any}</Link>;
            expect(() => renderToString(tree)).toThrow(TelegramNestingError);
            expect(() => render(tree)).toThrow(TelegramNestingError);
        }
    });

    test('throws TelegramNestingError for every forbidden child inside inline Code', () => {
        const forbiddenInsideCode = [
            <Bold>bold</Bold>,
            <Italic>italic</Italic>,
            <Underline>underline</Underline>,
            <Strike>strike</Strike>,
            <Spoiler>spoiler</Spoiler>,
            <Link href="https://example.com">link</Link>,
            <User id={123}>user</User>,
            <Emoji id="123">👍</Emoji>,
            <Time unix={1718000000}>time</Time>,
            <Code>nested code</Code>,
            <Pre>nested pre</Pre>,
            <Blockquote>nested bq</Blockquote>,
        ];

        for (const child of forbiddenInsideCode) {
            const tree = <Code>prefix {child as any} suffix</Code>;
            expect(() => renderToString(tree)).toThrow(TelegramNestingError);
            expect(() => render(tree)).toThrow(TelegramNestingError);
        }
    });

    test('throws TelegramNestingError for every forbidden child inside Pre', () => {
        const forbiddenInsidePre = [
            <Bold>bold</Bold>,
            <Italic>italic</Italic>,
            <Underline>underline</Underline>,
            <Strike>strike</Strike>,
            <Spoiler>spoiler</Spoiler>,
            <Link href="https://example.com">link</Link>,
            <User id={123}>user</User>,
            <Emoji id="123">👍</Emoji>,
            <Time unix={1718000000}>time</Time>,
            <Pre>nested pre</Pre>,
            <Blockquote>nested bq</Blockquote>,
        ];

        for (const child of forbiddenInsidePre) {
            const tree = <Pre>{child as any}</Pre>;
            expect(() => renderToString(tree)).toThrow(TelegramNestingError);
            expect(() => render(tree)).toThrow(TelegramNestingError);
        }
    });

    test('throws TelegramNestingError for formatting tags inside Emoji and Time', () => {
        const tags = [
            <Bold>b</Bold>,
            <Italic>i</Italic>,
            <Underline>u</Underline>,
            <Spoiler>sp</Spoiler>,
            <Code>mono</Code>,
            <Link href="https://example.com">a</Link>,
        ];

        for (const tag of tags) {
            const emojiTree = <Emoji id="12345">{tag as any}</Emoji>;
            expect(() => renderToString(emojiTree)).toThrow(TelegramNestingError);
            expect(() => render(emojiTree)).toThrow(TelegramNestingError);

            const timeTree = <Time unix={1718000000}>{tag as any}</Time>;
            expect(() => renderToString(timeTree)).toThrow(TelegramNestingError);
            expect(() => render(timeTree)).toThrow(TelegramNestingError);
        }
    });

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
                        // b starts inside a -> b must also end within a
                        expect(bEnd).toBeLessThanOrEqual(aEnd);
                    }
                }
            }
        }
    });
});
