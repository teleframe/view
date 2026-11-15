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
    isEntityNestingAllowed,
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
    validateEntitiesOverlap,
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

    test('throws TelegramNestingError when nesting Code, Pre, or Blockquote inside Bold for both render and renderToString', () => {
        // 1. Bold > Code
        const boldWithCode = <Bold>{(<Code>const x = 1;</Code>) as any}</Bold>;
        expect(() => renderToString(boldWithCode)).toThrow(TelegramNestingError);
        expect(() => render(boldWithCode)).toThrow(TelegramNestingError);

        try {
            render(boldWithCode);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('b');
            expect(err.childTag).toBe('code');
            expect(err.path).toBe('b > code');
        }

        // 2. Bold > Pre
        const boldWithPre = <Bold>{(<Pre>preformatted block</Pre>) as any}</Bold>;
        expect(() => renderToString(boldWithPre)).toThrow(TelegramNestingError);
        expect(() => render(boldWithPre)).toThrow(TelegramNestingError);

        try {
            render(boldWithPre);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('b');
            expect(err.childTag).toBe('pre');
            expect(err.path).toBe('b > pre');
        }

        // 3. Bold > Blockquote
        const boldWithBlockquote = <Bold>{(<Blockquote>quote</Blockquote>) as any}</Bold>;
        expect(() => renderToString(boldWithBlockquote)).toThrow(TelegramNestingError);
        expect(() => render(boldWithBlockquote)).toThrow(TelegramNestingError);

        try {
            render(boldWithBlockquote);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('b');
            expect(err.childTag).toBe('blockquote');
            expect(err.path).toBe('b > blockquote');
        }
    });

    test('throws TelegramNestingError for Code, Pre, and Blockquote inside all formatting components', () => {
        const formattingParents: Array<{ name: string; wrap: (child: any) => any }> = [
            { name: 'Italic', wrap: (child) => <Italic>{child}</Italic> },
            { name: 'Underline', wrap: (child) => <Underline>{child}</Underline> },
            { name: 'Strike', wrap: (child) => <Strike>{child}</Strike> },
            { name: 'Spoiler', wrap: (child) => <Spoiler>{child}</Spoiler> },
        ];

        const forbiddenChildren = [
            <Code>inline code</Code>,
            <Pre>code block</Pre>,
            <CodeBlock language="ts">const a = 1;</CodeBlock>,
            <Blockquote>block quotation</Blockquote>,
        ];

        for (const parent of formattingParents) {
            for (const child of forbiddenChildren) {
                const tree = parent.wrap(child);
                expect(() => renderToString(tree)).toThrow(TelegramNestingError);
                expect(() => render(tree)).toThrow(TelegramNestingError);
            }
        }
    });

    test('throws TelegramNestingError for deep transitive nesting of Code or Pre inside formatting chains', () => {
        // Bold > Italic > Code
        const deepCode = (
            <Bold>
                <Italic>{(<Code>nested code</Code>) as any}</Italic>
            </Bold>
        );
        expect(() => renderToString(deepCode)).toThrow(TelegramNestingError);
        expect(() => render(deepCode)).toThrow(TelegramNestingError);
        try {
            render(deepCode);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('i');
            expect(err.childTag).toBe('code');
            expect(err.path).toBe('b > i > code');
        }

        // Spoiler > Underline > Pre
        const deepPre = (
            <Spoiler>
                <Underline>{(<Pre>nested pre</Pre>) as any}</Underline>
            </Spoiler>
        );
        expect(() => renderToString(deepPre)).toThrow(TelegramNestingError);
        expect(() => render(deepPre)).toThrow(TelegramNestingError);
        try {
            render(deepPre);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('u');
            expect(err.childTag).toBe('pre');
            expect(err.path).toBe('tg-spoiler > u > pre');
        }

        // Blockquote > Bold > Code (Blockquote allows Bold, but Bold cannot contain Code)
        const bqBoldCode = (
            <Blockquote>
                <Bold>{(<Code>quote code</Code>) as any}</Bold>
            </Blockquote>
        );
        expect(() => renderToString(bqBoldCode)).toThrow(TelegramNestingError);
        expect(() => render(bqBoldCode)).toThrow(TelegramNestingError);
        try {
            render(bqBoldCode);
        } catch (err: any) {
            expect(err).toBeInstanceOf(TelegramNestingError);
            expect(err.parentTag).toBe('b');
            expect(err.childTag).toBe('code');
            expect(err.path).toBe('blockquote > b > code');
        }

        // Link > Bold > Code (Both Link and Bold forbid Code)
        const linkBoldCode = (
            <Link href="https://example.com">
                <Bold>{(<Code>link code</Code>) as any}</Bold>
            </Link>
        );
        expect(() => renderToString(linkBoldCode)).toThrow(TelegramNestingError);
        expect(() => render(linkBoldCode)).toThrow(TelegramNestingError);
    });

    test('throws TelegramNestingError when nesting Code or Pre inside intrinsic formatting tags', () => {
        const intrinsicCombinations = [
            <b>
                <code>text</code>
            </b>,
            <b>
                <pre>text</pre>
            </b>,
            <strong>
                <code>text</code>
            </strong>,
            <em>
                <code>text</code>
            </em>,
            <ins>
                <code>text</code>
            </ins>,
            <del>
                <code>text</code>
            </del>,
            <span class="tg-spoiler">
                <code>text</code>
            </span>,
            <b>
                <blockquote>text</blockquote>
            </b>,
        ];

        for (const tree of intrinsicCombinations) {
            expect(() => renderToString(tree)).toThrow(TelegramNestingError);
            expect(() => render(tree)).toThrow(TelegramNestingError);
        }
    });

    test('validates message entity pairing compatibility directly via validateEntitiesOverlap and isEntityNestingAllowed', () => {
        // isEntityNestingAllowed checks
        expect(isEntityNestingAllowed('bold', 'italic')).toBe(true);
        expect(isEntityNestingAllowed('bold', 'text_link')).toBe(true);
        expect(isEntityNestingAllowed('text_link', 'bold')).toBe(true);
        expect(isEntityNestingAllowed('blockquote', 'code')).toBe(true);
        expect(isEntityNestingAllowed('blockquote', 'pre')).toBe(true);
        expect(isEntityNestingAllowed('blockquote', 'bold')).toBe(true);
        expect(isEntityNestingAllowed('bold', 'custom_emoji')).toBe(true);
        expect(isEntityNestingAllowed('bold', 'date_time')).toBe(true);

        // Forbidden pairings
        expect(isEntityNestingAllowed('bold', 'code')).toBe(false);
        expect(isEntityNestingAllowed('bold', 'pre')).toBe(false);
        expect(isEntityNestingAllowed('bold', 'blockquote')).toBe(false);
        expect(isEntityNestingAllowed('code', 'bold')).toBe(false);
        expect(isEntityNestingAllowed('pre', 'bold')).toBe(false);
        expect(isEntityNestingAllowed('text_link', 'code')).toBe(false);
        expect(isEntityNestingAllowed('text_link', 'pre')).toBe(false);
        expect(isEntityNestingAllowed('text_link', 'date_time')).toBe(false);
        expect(isEntityNestingAllowed('text_link', 'custom_emoji')).toBe(false);
        expect(isEntityNestingAllowed('text_link', 'text_link')).toBe(false);
        expect(isEntityNestingAllowed('blockquote', 'blockquote')).toBe(false);
        expect(isEntityNestingAllowed('date_time', 'bold')).toBe(false);
        expect(isEntityNestingAllowed('custom_emoji', 'bold')).toBe(false);

        // validateEntitiesOverlap directly throws on incompatible overlapping entities
        const invalidEntityPairs = [
            [
                { type: 'bold', offset: 0, length: 5 },
                { type: 'code', offset: 0, length: 5 },
            ],
            [
                { type: 'code', offset: 0, length: 5 },
                { type: 'bold', offset: 0, length: 5 },
            ],
            [
                { type: 'bold', offset: 0, length: 10 },
                { type: 'pre', offset: 2, length: 4 },
            ],
            [
                { type: 'bold', offset: 0, length: 10 },
                { type: 'blockquote', offset: 0, length: 10 },
            ],
            [
                { type: 'text_link', offset: 0, length: 8, url: 'https://example.com' },
                {
                    type: 'date_time',
                    offset: 0,
                    length: 8,
                    unix_time: 123456,
                    date_time_format: 'r',
                },
            ],
        ];

        for (const entities of invalidEntityPairs) {
            expect(() => validateEntitiesOverlap(entities as any)).toThrow();
        }

        // Valid entities do not throw
        const validEntities = [
            { type: 'bold', offset: 0, length: 10 },
            { type: 'italic', offset: 2, length: 5 },
        ];
        expect(() => validateEntitiesOverlap(validEntities as any)).not.toThrow();
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
