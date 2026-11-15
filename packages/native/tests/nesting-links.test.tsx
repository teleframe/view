/**
 * @fileoverview Unit tests for Link, User, and Bold nesting rules.
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
    TelegramNestingError,
    Time,
    User,
} from '../lib';

describe('Telegram Nesting Validation - Links & Bold Restrictions', () => {
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
});
