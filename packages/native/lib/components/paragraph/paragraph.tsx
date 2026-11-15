/**
 * @fileoverview Paragraph component for semantic and visual block separation in Telegram messages
 * @module @teleframe/view/native/components/paragraph/paragraph
 */

import type { NativeChildren, TelegramNativeElement } from '@native/tags/base';
import type { NativeParagraphProps } from './types';

/**
 * Paragraph component for visually and semantically separating blocks of text.
 * Supports both JSX `<Paragraph>text</Paragraph>` and functional `paragraph('text')`.
 */
export function Paragraph(props: NativeParagraphProps): TelegramNativeElement;
export function Paragraph(children: NativeChildren, spacing?: number): TelegramNativeElement;
export function Paragraph(
    propsOrChildren: NativeParagraphProps | NativeChildren,
    spacingArg?: number,
): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        ('children' in propsOrChildren ||
            'spacing' in propsOrChildren ||
            'lines' in propsOrChildren ||
            'after' in propsOrChildren ||
            'before' in propsOrChildren ||
            'count' in propsOrChildren)
    ) {
        const { children, spacing, lines, after, before, count } =
            propsOrChildren as NativeParagraphProps;
        const lineCount = after ?? spacing ?? lines ?? count ?? 2;
        return (
            <p count={lineCount} before={before}>
                {children}
            </p>
        );
    }

    const lineCount = spacingArg ?? 2;
    return <p count={lineCount}>{propsOrChildren as NativeChildren}</p>;
}

/**
 * Functional helper for paragraphs without JSX: `paragraph('Hello', 1)`.
 */
export const paragraph = (children: NativeChildren, spacing?: number): TelegramNativeElement => {
    return Paragraph(children, spacing);
};

/**
 * Shorthand alias for `<Paragraph>`.
 */
export const P = Paragraph;

/**
 * Functional shorthand alias for `paragraph`.
 */
export const p = paragraph;

export default Paragraph;
