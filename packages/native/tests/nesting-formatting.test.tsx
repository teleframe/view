/**
 * @fileoverview Unit tests for formatting tags nesting restrictions and transitive chains.
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Code,
    CodeBlock,
    Italic,
    Link,
    Pre,
    render,
    renderToString,
    Spoiler,
    Strike,
    TelegramNestingError,
    Underline,
} from '../lib';

describe('Telegram Nesting Validation - Formatting & Transitive Chains', () => {
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
});
