/**
 * @fileoverview Type definitions for Underline component
 * @module @telegram-markup/native/components/underline/types
 */

import type { BaseNativeTagWithTagNameProps } from '../../tags/base';

/**
 * Properties for `<Underline>` component.
 */
export interface NativeUnderlineProps extends BaseNativeTagWithTagNameProps {
    /** Underlying HTML tag: 'u' (default) or 'ins' */
    tagName?: 'u' | 'ins';
}
