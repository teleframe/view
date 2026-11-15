/**
 * @fileoverview Unit tests for advanced MessageEntity types (links, quotes, emoji, time)
 */

import { describe, expect, test } from 'bun:test';
import { Blockquote, Bold, Br, Divider, Emoji, Link, render, Time, User } from '../lib';

describe('MessageEntity Advanced Types', () => {
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
