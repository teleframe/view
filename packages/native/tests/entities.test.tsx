/**
 * @fileoverview Unit tests for MessageEntity compiler and UTF-16 offset calculations
 */

import { describe, expect, test } from 'bun:test';
import { Bold, Br, Code, Italic, Pre, render, Spoiler, Strike, Underline } from '../lib';

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
        const result = render(
            <>
                🚀 <Bold>Rocket</Bold> 🎉 <Italic>Party</Italic>
            </>,
        );

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
});
