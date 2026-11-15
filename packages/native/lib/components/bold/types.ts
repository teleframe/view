/**
 * @fileoverview Type definitions for Bold component
 * @module @teleframe/view/native/components/bold/types
 */

import type { BaseNativeTagWithTagNameProps } from '@native/tags/base';

/**
 * Properties for `<Bold>` component.
 */
export interface NativeBoldProps extends BaseNativeTagWithTagNameProps {
    /** Underlying HTML tag: 'b' (default) or 'strong' */
    tagName?: 'b' | 'strong';
}
