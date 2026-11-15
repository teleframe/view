/**
 * @fileoverview Inline code formatting component and function for Telegram messages
 * @module @teleframe/view/native/components/code/code
 */

import type { CodeChildren, TelegramNativeElement } from '../../tags/base';
import type { Language } from '../../tags/languages';
import type { NativeCodeProps } from './types';

/**
 * Monospace code component rendering `<code>`.
 * Supports both JSX usage `<Code>text</Code>` and functional usage `Code('text')`.
 */
export function Code(props: NativeCodeProps): TelegramNativeElement;
export function Code(children: CodeChildren): TelegramNativeElement;
export function Code(propsOrChildren: NativeCodeProps | CodeChildren): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'language' in propsOrChildren)
    ) {
        const { children, language } = propsOrChildren as NativeCodeProps;
        if (language) {
            return {
                type: 'pre',
                props: {
                    children: {
                        type: 'code',
                        props: {
                            class: `language-${language}`,
                            children,
                        },
                    },
                },
            };
        }
        return {
            type: 'code',
            props: { children },
        };
    }
    return {
        type: 'code',
        props: { children: propsOrChildren as CodeChildren },
    };
}

/**
 * Functional helper for monospace code without JSX: `code('const x = 1')`.
 */
export const code = (children: CodeChildren, language?: Language): TelegramNativeElement => {
    return language ? Code({ children, language }) : Code(children);
};

export default Code;
