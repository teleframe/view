/**
 * @fileoverview Type definitions for Paragraph and P components
 * @module @telegram-markup/native/components/paragraph/types
 */

import type { BaseNativeTagProps } from '../../tags/base';

/**
 * Properties for `<Paragraph>` and `<P>` text block components.
 */
export interface NativeParagraphProps extends BaseNativeTagProps {
    /**
     * Number of line breaks after the paragraph (default: 2).
     */
    spacing?: number;

    /**
     * Alias for `spacing` and `after`.
     */
    lines?: number;

    /**
     * Alias for `spacing` and `after`.
     */
    count?: number;

    /**
     * Number of line breaks appended after the paragraph (default: 2).
     */
    after?: number;

    /**
     * Number of line breaks prepended before the paragraph (default: 0).
     */
    before?: number;
}

/**
 * Alias for `NativeParagraphProps`.
 */
export type NativePProps = NativeParagraphProps;
