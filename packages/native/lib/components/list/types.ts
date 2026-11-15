/**
 * @fileoverview Type definitions and options for Telegram Native List components
 * @module @teleframe/view/native/components/list/types
 */

import type { BaseNativeTagProps } from '../../tags/base';

/**
 * Supported list types: bullet points, ordered numbers, or dashes.
 */
export type ListType = 'bullet' | 'number' | 'dash';

/**
 * Numbering styles for ordered lists:
 * - `dot`: `1. `, `2. `
 * - `paren`: `1) `, `2) `
 * - `roman`: `I. `, `II. `, `III. `
 * - `alpha`: `a. `, `b. `, `c. `
 */
export type NumberStyle = 'dot' | 'paren' | 'roman' | 'alpha';

/**
 * Properties for individual list item `<Li>` or `<li>`.
 */
export interface NativeLiProps extends BaseNativeTagProps {
    /** Optional custom marker or bullet string overriding parent list marker */
    marker?: string;
    /** Optional nesting indentation level (default: 0) */
    indent?: number;
}

/**
 * Properties for universal `<List>` component.
 */
export interface NativeListProps extends BaseNativeTagProps {
    /** List layout kind: bullet points, ordered numbers, or dashes */
    type?: ListType;
    /** Custom marker string or dynamic function based on 1-based index */
    marker?: string | ((index: number) => string);
    /** Starting index for numbered lists (default: 1) */
    start?: number;
    /** Number numbering format style (default: 'dot') */
    numberStyle?: NumberStyle;
    /** Base indentation level in spaces (each level adds 2 spaces) */
    indent?: number;
    /** Line breaks between list items (default: 1) */
    spacing?: number;
    /** Whether to indent wrapped multiline item text */
    indentMultiline?: boolean;
}

/**
 * Properties for unordered bullet list `<Ul>` component.
 */
export interface NativeUlProps extends Omit<NativeListProps, 'type'> {
    /** Preset bullet style or custom character string */
    bullet?: 'bullet' | 'dash' | 'star' | 'circle' | 'check' | 'arrow' | string;
}

/**
 * Properties for ordered numbered list `<Ol>` component.
 */
export interface NativeOlProps extends Omit<NativeListProps, 'type'> {
    /** Number numbering format style (default: 'dot') */
    numberStyle?: NumberStyle;
    /** Starting index (default: 1) */
    start?: number;
}
