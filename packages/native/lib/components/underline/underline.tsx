/**
 * @fileoverview Underline formatting component and function for Telegram messages
 * @module @telegram-markup/native/components/underline/underline
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeUnderlineProps } from './types';

/**
 * Underline text component rendering `<u>` or `<ins>`.
 * Supports both JSX usage `<Underline>text</Underline>` and functional usage `Underline('text')`.
 */
export function Underline(props: NativeUnderlineProps): TelegramNativeElement;
export function Underline(children: NativeChildren): TelegramNativeElement;
export function Underline(
    propsOrChildren: NativeUnderlineProps | NativeChildren,
): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'tagName' in propsOrChildren)
    ) {
        const { children, tagName = 'u' } = propsOrChildren as NativeUnderlineProps;
        if (tagName === 'ins') {
            return <ins>{children}</ins>;
        }
        return <u>{children}</u>;
    }
    return <u>{propsOrChildren as NativeChildren}</u>;
}

/**
 * Functional helper for underline text without JSX: `underline('Hello')` or `underline('Hello', 'ins')`.
 */
export const underline = (
    children: NativeChildren,
    tagName?: 'u' | 'ins',
): TelegramNativeElement => {
    return tagName ? Underline({ children, tagName }) : Underline(children);
};

export default Underline;
