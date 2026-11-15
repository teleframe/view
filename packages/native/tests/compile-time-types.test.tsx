/**
 * @fileoverview Compile-time type checking tests with @ts-expect-error
 */

import { describe, expect, test } from 'bun:test';
import { Bold, Code, Emoji, Time } from '../lib';

describe('Compile-Time Type Enforcement (Stage 4 & 6)', () => {
    test('enforces compile-time type errors for invalid tags and structures', () => {
        // 1. Invalid non-Telegram intrinsic tag 'div'
        // @ts-expect-error - 'div' does not exist on type 'JSX.IntrinsicElements'
        const _invalidDiv = <div />;

        // 2. Invalid non-Telegram intrinsic tag 'table'
        // @ts-expect-error - 'table' does not exist on type 'JSX.IntrinsicElements'
        const _invalidTable = <table />;

        // 3. Code cannot contain formatting tags (only text/numbers allowed)
        const _formattingInCode = (
            // @ts-expect-error - Bold element is not assignable to type CodeChildren
            <Code>
                <Bold>Bold inside code</Bold>
            </Code>
        );

        // 4. Custom Emoji cannot contain formatting tags (only string allowed)
        const _formattingInEmoji = (
            // @ts-expect-error - Bold element is not assignable to type EmojiChildren
            <Emoji id="123">
                <Bold>👍</Bold>
            </Emoji>
        );

        // 5. Time component: mutually exclusive date and unix
        // @ts-expect-error - 'unix' cannot be provided when 'date' is present
        const _dateAndUnix = <Time date={new Date()} unix={1718000000} />;

        // 6. Time component: relative cannot be combined with weekday
        // @ts-expect-error - 'weekday' cannot be provided when 'relative' is true
        const _relativeAndWeekday = <Time date={new Date()} relative weekday />;

        // 7. Time component: invalid format string
        // @ts-expect-error - 'invalid-format' is not assignable to TimeFormat
        const _invalidFormat = <Time date={new Date()} format="invalid-format" />;

        expect(true).toBe(true);
    });
});
