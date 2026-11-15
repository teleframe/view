/**
 * @fileoverview Unit tests for message entity overlap validation and forbidden code/pre/emoji/time children.
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Code,
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

describe('Telegram Nesting Validation - Entity Overlap & Forbidden Content', () => {
    test('validates message entity pairing compatibility directly via validateEntitiesOverlap and isEntityNestingAllowed', () => {
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

        const validEntities = [
            { type: 'bold', offset: 0, length: 10 },
            { type: 'italic', offset: 2, length: 5 },
        ];
        expect(() => validateEntitiesOverlap(validEntities as any)).not.toThrow();

        const unsortedValidEntities = [
            { type: 'italic', offset: 2, length: 5 },
            { type: 'bold', offset: 0, length: 10 },
        ];
        expect(() => validateEntitiesOverlap(unsortedValidEntities as any)).not.toThrow();
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
});
