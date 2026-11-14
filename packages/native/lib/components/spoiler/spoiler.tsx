/**
 * @fileoverview Spoiler formatting component and function for Telegram messages
 * @module @telegram-markup/native/components/spoiler/spoiler
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeSpoilerProps } from './types';

/**
 * Spoiler text component rendering `<tg-spoiler>` or `<span class="tg-spoiler">`.
 * Supports both JSX usage `<Spoiler>text</Spoiler>` and functional usage `Spoiler('text')`.
 */
export function Spoiler(props: NativeSpoilerProps): TelegramNativeElement;
export function Spoiler(children: NativeChildren): TelegramNativeElement;
export function Spoiler(
    propsOrChildren: NativeSpoilerProps | NativeChildren,
): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'tagName' in propsOrChildren)
    ) {
        const { children, tagName = 'tg-spoiler' } = propsOrChildren as NativeSpoilerProps;
        if (tagName === 'span') return <span class="tg-spoiler">{children}</span>;
        return <tg-spoiler>{children}</tg-spoiler>;
    }
    return <tg-spoiler>{propsOrChildren as NativeChildren}</tg-spoiler>;
}

/**
 * Functional helper for spoiler text without JSX: `spoiler('Secret text')`.
 */
export const spoiler = (children: NativeChildren): TelegramNativeElement => Spoiler(children);

export default Spoiler;
