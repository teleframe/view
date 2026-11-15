/**
 * @fileoverview Blockquote formatting component and function for Telegram messages
 * @module @teleframe/view/native/components/blockquote/blockquote
 */

import type { NativeChildren, TelegramNativeElement } from '@native/tags/base';
import type { NativeBlockquoteProps } from './types';

/**
 * Block quotation component rendering `<blockquote>`.
 * Supports both JSX usage `<Blockquote>quote</Blockquote>` and functional usage `Blockquote('quote')`.
 */
export function Blockquote(props: NativeBlockquoteProps): TelegramNativeElement;
export function Blockquote(children: NativeChildren): TelegramNativeElement;
export function Blockquote(
    propsOrChildren: NativeBlockquoteProps | NativeChildren,
): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'expandable' in propsOrChildren)
    ) {
        const { children, expandable } = propsOrChildren as NativeBlockquoteProps;
        return <blockquote expandable={expandable}>{children}</blockquote>;
    }
    return <blockquote>{propsOrChildren as NativeChildren}</blockquote>;
}

/**
 * Functional helper for blockquote without JSX: `blockquote('Quote text', true)`.
 */
export const blockquote = (
    children: NativeChildren,
    expandable?: boolean,
): TelegramNativeElement => {
    return expandable !== undefined ? Blockquote({ children, expandable }) : Blockquote(children);
};

export default Blockquote;
