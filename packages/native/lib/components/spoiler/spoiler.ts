/**
 * @fileoverview Spoiler formatting component and function for Telegram messages
 * @module @teleframe/view/native/components/spoiler/spoiler
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
        if (tagName === 'span') {
            return {
                type: 'span',
                props: { class: 'tg-spoiler', children },
            };
        }
        return {
            type: 'tg-spoiler',
            props: { children },
        };
    }
    return {
        type: 'tg-spoiler',
        props: { children: propsOrChildren as NativeChildren },
    };
}

/**
 * Functional helper for spoiler text without JSX: `spoiler('Secret text')`.
 */
export const spoiler = (children: NativeChildren): TelegramNativeElement => Spoiler(children);

export default Spoiler;
