/**
 * @fileoverview Italic formatting component and function for Telegram messages
 * @module @teleframe/view/native/components/italic/italic
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeItalicProps } from './types';

/**
 * Italic text component rendering `<i>` or `<em>`.
 * Supports both JSX usage `<Italic>text</Italic>` and functional usage `Italic('text')`.
 */
export function Italic(props: NativeItalicProps): TelegramNativeElement;
export function Italic(children: NativeChildren): TelegramNativeElement;
export function Italic(propsOrChildren: NativeItalicProps | NativeChildren): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren || 'tagName' in propsOrChildren)
    ) {
        const { children, tagName = 'i' } = propsOrChildren as NativeItalicProps;
        return {
            type: tagName === 'em' ? 'em' : 'i',
            props: { children },
        };
    }
    return {
        type: 'i',
        props: { children: propsOrChildren as NativeChildren },
    };
}

/**
 * Functional helper for italic text without JSX: `italic('Hello')` or `italic('Hello', 'em')`.
 */
export const italic = (children: NativeChildren, tagName?: 'i' | 'em'): TelegramNativeElement => {
    return tagName ? Italic({ children, tagName }) : Italic(children);
};

export default Italic;
