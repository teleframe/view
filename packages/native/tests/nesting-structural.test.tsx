/**
 * @fileoverview Unit tests for structural nesting rules (blockquote, pre, code, links)
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Code,
    Emoji,
    Italic,
    Link,
    Pre,
    render,
    renderToString,
    TelegramNestingError,
    Time,
    User,
} from '../lib';

describe('Telegram Nesting Validation - Structural Rules', () => {
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
            expect(err).toBeInstanceOf(TelegramNestingError);
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
});
