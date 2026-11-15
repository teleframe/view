/**
 * @fileoverview Unit tests for single-pass component evaluation and strict required value validations.
 */

import { describe, expect, test } from 'bun:test';
import {
    Each,
    Emoji,
    Link,
    normalizeTimestamp,
    render,
    renderToString,
    Show,
    Time,
    User,
} from '../lib';

describe('Single-pass Component and Callback Evaluation', () => {
    test('executes custom function components exactly once during renderToString', () => {
        let executions = 0;
        const DynamicComponent = () => {
            executions++;
            return <b>Call #{executions}</b>;
        };

        const result = renderToString(<DynamicComponent />);
        expect(result).toBe('<b>Call #1</b>');
        expect(executions).toBe(1);
    });

    test('executes custom function components exactly once during compileToEntities (render)', () => {
        let executions = 0;
        const DynamicComponent = () => {
            executions++;
            return <b>Call #{executions}</b>;
        };

        const result = render(<DynamicComponent />);
        expect(result.text).toBe('Call #1');
        expect(executions).toBe(1);
    });

    test('executes Show render callback exactly once', () => {
        let showCalls = 0;
        const element = (
            <Show when={true}>
                {() => {
                    showCalls++;
                    return <i>Callback called once</i>;
                }}
            </Show>
        );

        const html = renderToString(element);
        expect(html).toBe('<i>Callback called once</i>');
        expect(showCalls).toBe(1);
    });

    test('executes Each item callbacks exactly once per item', () => {
        const itemCalls: string[] = [];
        const items = ['apple', 'banana', 'cherry'];

        const element = (
            <Each items={items}>
                {(item: string) => {
                    itemCalls.push(item);
                    return <code>{item}</code>;
                }}
            </Each>
        );

        const html = renderToString(element);
        expect(html).toBe('<code>apple</code>\n<code>banana</code>\n<code>cherry</code>');
        expect(itemCalls).toEqual(['apple', 'banana', 'cherry']);
    });
});

describe('Strict Required Value Validation', () => {
    test('normalizeTimestamp throws descriptive error on null or undefined', () => {
        expect(() => normalizeTimestamp(null)).toThrow(
            /Time component requires a Date instance or unix timestamp/,
        );
        expect(() => normalizeTimestamp(undefined)).toThrow(
            /Time component requires a Date instance or unix timestamp/,
        );
    });

    test('Time component throws error when neither date nor unix is provided', () => {
        // @ts-expect-error - testing runtime missing required value
        expect(() => renderToString(<Time />)).toThrow(
            /Time component requires a Date instance or unix timestamp/,
        );
    });

    test('Link and <a> throw descriptive error when href is empty or missing', () => {
        // Link with empty string
        expect(() => renderToString(<Link href="">Click</Link>)).toThrow(
            /<Link> requires either an "href" or "userId" prop/,
        );
        expect(() => renderToString(Link('', 'Click'))).toThrow(
            /<Link> requires a non-empty "href" prop/,
        );

        // Raw <a> tag without href or with empty href
        // @ts-expect-error - testing raw <a> without href
        expect(() => renderToString(<a>No href</a>)).toThrow(
            /<a> tag requires a non-empty "href" attribute/,
        );
        expect(() => renderToString(<a href="">Empty href</a>)).toThrow(
            /<a> tag requires a non-empty "href" attribute/,
        );
        // @ts-expect-error - testing raw <a> without href in render()
        expect(() => render(<a>No href</a>)).toThrow(
            /<a> tag requires a non-empty "href" attribute/,
        );
    });

    test('User component and user tag validate user ID is a positive integer', () => {
        // Missing or empty ID
        // @ts-expect-error - testing missing ID
        expect(() => renderToString(<User />)).toThrow(/<User> requires a valid "id" prop/);
        expect(() => renderToString(<User id="">Empty</User>)).toThrow(
            /<User> requires a valid "id" prop/,
        );

        // Non-positive or non-integer ID
        expect(() => renderToString(<User id={-5}>Negative</User>)).toThrow(
            /Telegram user ID must be a positive integer/,
        );
        expect(() => renderToString(<User id="abc">Invalid</User>)).toThrow(
            /Telegram user ID must be a positive integer/,
        );
        expect(() => renderToString(<User id={3.14}>Float</User>)).toThrow(
            /Telegram user ID must be a positive integer/,
        );

        // Same validation in render() entity mode
        expect(() => render(<User id={-1}>Bad ID</User>)).toThrow(
            /Telegram user ID must be a positive integer/,
        );

        // Valid user ID renders properly
        expect(renderToString(<User id={12345}>Alice</User>)).toBe(
            '<a href="tg://user?id=12345">Alice</a>',
        );
    });

    test('Emoji component and tg-emoji tag validate numeric emoji ID', () => {
        // Missing ID
        // @ts-expect-error - testing missing emoji ID
        expect(() => renderToString(<Emoji>👍</Emoji>)).toThrow(
            /<Emoji> requires a valid "id" prop/,
        );
        expect(() => renderToString(<Emoji id="">👍</Emoji>)).toThrow(
            /<Emoji> requires a valid "id" prop/,
        );

        // Non-numeric ID
        expect(() => renderToString(<Emoji id="not-a-number">👍</Emoji>)).toThrow(
            /Telegram custom emoji ID must be a numeric string of digits/,
        );

        // Raw <tg-emoji> tag validation in renderToString
        // @ts-expect-error - testing raw tg-emoji without id
        expect(() => renderToString(<tg-emoji>👍</tg-emoji>)).toThrow(
            /<tg-emoji> requires a non-empty "emoji-id" attribute/,
        );
        expect(() => renderToString(<tg-emoji emoji-id="invalid">👍</tg-emoji>)).toThrow(
            /Telegram custom emoji ID must be a numeric string of digits/,
        );

        // Raw <tg-emoji> tag validation in render()
        // @ts-expect-error - testing raw tg-emoji in render
        expect(() => render(<tg-emoji>👍</tg-emoji>)).toThrow(
            /<tg-emoji> requires a non-empty "emoji-id" attribute/,
        );

        // Valid custom emoji ID renders properly
        expect(renderToString(<Emoji id="5368324170671202286">🔥</Emoji>)).toBe(
            '<tg-emoji emoji-id="5368324170671202286">🔥</tg-emoji>',
        );
    });
});
