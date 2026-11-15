/**
 * @fileoverview Preformatted code block component and function for Telegram messages
 * @module @teleframe/view/native/components/pre/pre
 */

import type { NativeChildren, TelegramNativeElement } from '@native/tags/base';
import type { Language } from '@native/tags/languages';
import type { NativePreProps } from './types';

/**
 * Preformatted code block component rendering `<pre>`.
 * Supports both JSX usage `<Pre>code</Pre>` and functional usage `Pre('code')`.
 */
export function Pre(props: NativePreProps): TelegramNativeElement;
export function Pre(children: NativeChildren): TelegramNativeElement;
export function Pre(propsOrChildren: NativePreProps | NativeChildren): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'language' in propsOrChildren)
    ) {
        const { children, language } = propsOrChildren as NativePreProps;
        return <pre language={language}>{children}</pre>;
    }
    return <pre>{propsOrChildren as NativeChildren}</pre>;
}

/**
 * Functional helper for preformatted block without JSX: `pre('code', 'typescript')`.
 */
export const pre = (children: NativeChildren, language?: Language): TelegramNativeElement => {
    return language ? Pre({ children, language }) : Pre(children);
};

export default Pre;
