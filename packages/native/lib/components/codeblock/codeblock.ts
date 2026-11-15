/**
 * @fileoverview Multi-line code block component for Telegram messages
 * @module @teleframe/view/native/components/codeblock/codeblock
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
    let code: any;
    let lang: string | undefined;
    if (typeof propsOrCode === 'string') {
        code = propsOrCode;
        lang = language;
    } else {
        code = propsOrCode?.children;
        lang = propsOrCode?.language ?? language;
    }

    if (lang) {
        return {
            type: 'pre',
            props: {
                children: {
                    type: 'code',
                    props: {
                        class: `language-${lang}`,
                        children: code,
                    },
                },
            },
        };
    }

    return {
        type: 'pre',
        props: { children: code },
    };
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
