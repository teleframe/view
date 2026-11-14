/**
 * @fileoverview Strikethrough formatting component and function for Telegram messages
 * @module @telegram-markup/native/components/strike/strike
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeStrikeProps } from './types';

/**
 * Strikethrough text component rendering `<s>`, `<strike>`, or `<del>`.
 * Supports both JSX usage `<Strike>text</Strike>` and functional usage `Strike('text')`.
 */
export function Strike(props: NativeStrikeProps): TelegramNativeElement;
export function Strike(children: NativeChildren): TelegramNativeElement;
export function Strike(propsOrChildren: NativeStrikeProps | NativeChildren): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'tagName' in propsOrChildren)
    ) {
        const { children, tagName = 's' } = propsOrChildren as NativeStrikeProps;
        if (tagName === 'strike') return <strike>{children}</strike>;
        if (tagName === 'del') return <del>{children}</del>;
        return <s>{children}</s>;
    }
    return <s>{propsOrChildren as NativeChildren}</s>;
}

/**
 * Functional helper for strikethrough text without JSX: `strike('Hello')`.
 */
export const strike = (
    children: NativeChildren,
    tagName?: 's' | 'strike' | 'del',
): TelegramNativeElement => {
    return tagName ? Strike({ children, tagName }) : Strike(children);
};

export const Strikethrough = Strike;
export const strikethrough = strike;

export default Strike;
