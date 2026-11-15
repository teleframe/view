/**
 * @fileoverview Type definitions for Spoiler component
 * @module @teleframe/view/native/components/spoiler/types
 */

import type { BaseNativeTagWithTagNameProps } from '@native/tags/base';

/**
 * Properties for `<Spoiler>` component.
 */
export interface NativeSpoilerProps extends BaseNativeTagWithTagNameProps {
    /** Underlying HTML tag: 'tg-spoiler' (default) or 'span' */
    tagName?: 'tg-spoiler' | 'span';
}
