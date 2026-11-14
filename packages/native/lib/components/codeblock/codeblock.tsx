/**
 * @fileoverview Multi-line code block component for Telegram messages
 * @module @telegram-markup/native/components/codeblock/codeblock
 */

import type { TelegramNativeElement } from '../../tags/base';
import type { NativeCodeblockProps } from './types';

/**
 * Multi-line code block component with syntax highlighting.
 * Supports both JSX `<CodeBlock language="typescript">code</CodeBlock>` and functional `codeblock(code, 'typescript')`.
 */
export function CodeBlock(props: NativeCodeblockProps): TelegramNativeElement;
export function CodeBlock(code: string, language?: string): TelegramNativeElement;
export function CodeBlock(
    propsOrCode: NativeCodeblockProps | string,
    language?: string,
): TelegramNativeElement {
    if (typeof propsOrCode === 'string') {
        return <codeblock language={language}>{propsOrCode}</codeblock>;
    }
    const { children, language: lang } = propsOrCode ?? {};
    return <codeblock language={lang}>{children}</codeblock>;
}

/**
 * Functional helper for code block without JSX: `codeblock('const x = 1;', 'typescript')`.
 */
export const codeBlock = (
    codeOrProps: string | NativeCodeblockProps,
    language?: string,
): TelegramNativeElement => {
    if (typeof codeOrProps === 'string') {
        return CodeBlock(codeOrProps, language);
    }
    return CodeBlock(codeOrProps);
};

/**
 * Shorthand alias for `<CodeBlock>`.
 */
export const Codeblock = CodeBlock;

/**
 * Functional shorthand alias for `codeBlock`.
 */
export const codeblock = codeBlock;

export default CodeBlock;
