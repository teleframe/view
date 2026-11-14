/**
 * @fileoverview Bold formatting component and function for Telegram messages
 * @module @telegram-markup/native/components/bold/bold
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeBoldProps } from './types';

/**
 * Bold text component rendering `<b>` or `<strong>`.
 * Supports both JSX usage `<Bold>text</Bold>` and functional usage `Bold('text')`.
 */
export function Bold(props: NativeBoldProps): TelegramNativeElement;
export function Bold(children: NativeChildren): TelegramNativeElement;
export function Bold(propsOrChildren: NativeBoldProps | NativeChildren): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'tagName' in propsOrChildren)
    ) {
        const { children, tagName = 'b' } = propsOrChildren as NativeBoldProps;
        if (tagName === 'strong') {
            return <strong>{children}</strong>;
        }
        return <b>{children}</b>;
    }
    return <b>{propsOrChildren as NativeChildren}</b>;
}

/**
 * Functional helper for bold text without JSX: `bold('Hello')` or `bold('Hello', 'strong')`.
 */
export const bold = (children: NativeChildren, tagName?: 'b' | 'strong'): TelegramNativeElement => {
    return tagName ? Bold({ children, tagName }) : Bold(children);
};

export default Bold;
