/**
 * @fileoverview Unit tests for MessageEntity compiler and UTF-16 offset calculations
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Br,
    Code,
    CodeBlock,
    Divider,
    Emoji,
    Italic,
    Link,
    Pre,
    render,
    Spoiler,
    Strike,
    Time,
    Underline,
    User,
} from '../lib';

describe('MessageEntity Compiler (render)', () => {
    test('renders plain text with no entities', () => {
        const result = render('Hello, Telegram!');
        expect(result.text).toBe('Hello, Telegram!');
        expect(result.entities).toEqual([]);
    });

    test('compiles basic formatting entities with exact UTF-16 offsets', () => {
        const result = render(
            <>
                <Bold>Hello</Bold> <Italic>world</Italic> <Underline>underlined</Underline>{' '}
                <Strike>deleted</Strike> <Spoiler>secret</Spoiler>
            </>,
        );

        expect(result.text).toBe('Hello world underlined deleted secret');
        expect(result.entities).toEqual([
            { type: 'bold', offset: 0, length: 5 },
            { type: 'italic', offset: 6, length: 5 },
            { type: 'underline', offset: 12, length: 10 },
            { type: 'strikethrough', offset: 23, length: 7 },
            { type: 'spoiler', offset: 31, length: 6 },
        ]);
    });

    test('accurately calculates UTF-16 code units for emojis and surrogate pairs', () => {
        // "🚀" is 2 UTF-16 code units (\uD83D\uDE80)
        // "🎉" is 2 UTF-16 code units
        const result = render(
            <>
                🚀 <Bold>Rocket</Bold> 🎉 <Italic>Party</Italic>
            </>,
        );

        // "🚀 " = 2 + 1 = 3 code units
        // "Rocket" = 6 code units
        // " 🎉 " = 1 + 2 + 1 = 4 code units
        // "Party" = 5 code units
        expect(result.text).toBe('🚀 Rocket 🎉 Party');
        expect(result.entities).toEqual([
            { type: 'bold', offset: 3, length: 6 },
            { type: 'italic', offset: 13, length: 5 },
        ]);
    });

    test('handles Cyrillic and multilingual text with proper UTF-16 lengths', () => {
        const result = render(
            <>
                <Bold>Привет</Bold>, <Italic>мир</Italic>!
            </>,
        );

        expect(result.text).toBe('Привет, мир!');
        expect(result.entities).toEqual([
            { type: 'bold', offset: 0, length: 6 },
            { type: 'italic', offset: 8, length: 3 },
        ]);
    });

    test('compiles nested formatting and sorts outer entity first for identical offsets', () => {
        const result = render(
            <Bold>
                <Italic>Bold and Italic</Italic> normal bold
            </Bold>,
        );

        expect(result.text).toBe('Bold and Italic normal bold');
        expect(result.entities).toEqual([
            { type: 'bold', offset: 0, length: 27 },
            { type: 'italic', offset: 0, length: 15 },
        ]);
    });

    test('compiles code and pre with programming language', () => {
        const result = render(
            <>
                Inline: <Code>const x = 1;</Code>
                <Br />
                <Pre language="typescript">const greeting: string = "hello";</Pre>
            </>,
        );

        expect(result.text).toBe('Inline: const x = 1;\nconst greeting: string = "hello";');
        expect(result.entities).toEqual([
            { type: 'code', offset: 8, length: 12 },
            {
                type: 'pre',
                offset: 21,
                length: 33,
                language: 'typescript',
            },
        ]);
    });

    test('compiles web hyperlinks and user text mentions', () => {
        const result = render(
            <>
                Visit <Link href="https://example.com">Example</Link> or{' '}
                <User id={123456789}>Alice</User>
            </>,
        );

        expect(result.text).toBe('Visit Example or Alice');
        expect(result.entities).toEqual([
            {
                type: 'text_link',
                offset: 6,
                length: 7,
                url: 'https://example.com',
            },
            {
                type: 'text_mention',
                offset: 17,
                length: 5,
                user: { id: 123456789 },
            },
        ]);
    });

    test('compiles standard blockquote and expandable blockquote', () => {
        const resultStandard = render(<Blockquote>Simple quote</Blockquote>);
        expect(resultStandard.entities).toEqual([{ type: 'blockquote', offset: 0, length: 12 }]);

        const resultExpandable = render(<Blockquote expandable>Long collapsible quote</Blockquote>);
        expect(resultExpandable.entities).toEqual([
            { type: 'expandable_blockquote', offset: 0, length: 22 },
        ]);
    });

    test('compiles custom emoji and formatted date_time entities', () => {
        const result = render(
            <>
                <Emoji id="5368324170671202286">👍</Emoji>{' '}
                <Time unix={1718000000} format="relative">
                    5 minutes ago
                </Time>
            </>,
        );

        expect(result.text).toBe('👍 5 minutes ago');
        expect(result.entities).toEqual([
            {
                type: 'custom_emoji',
                offset: 0,
                length: 2,
                custom_emoji_id: '5368324170671202286',
            },
            {
                type: 'date_time',
                offset: 3,
                length: 13,
                unix_time: 1718000000,
                date_time_format: 'r',
            },
        ]);
    });

    test('does not emit entities for empty elements', () => {
        const result = render(
            <>
                <b></b>
                <i>{null}</i>
                <Bold>{undefined}</Bold>
                Text
            </>,
        );

        expect(result.text).toBe('Text');
        expect(result.entities).toEqual([]);
    });

    test('handles line breaks and dividers correctly in text stream', () => {
        const result = render(
            <>
                Line 1<Br count={2} />
                <Divider char="=" length={5} before={0} after={1} />
                Line 2
            </>,
        );

        expect(result.text).toBe('Line 1\n\n=====\nLine 2');
        expect(result.entities).toEqual([]);
    });
});
