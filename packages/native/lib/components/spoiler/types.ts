/**
 * @fileoverview Type definitions for Spoiler component
 * @module @telegram-markup/native/components/spoiler/types
 */

import type { BaseNativeTagWithTagNameProps } from '../../tags/base';

/**
 * Properties for `<Spoiler>` component.
 */
export interface NativeSpoilerProps extends BaseNativeTagWithTagNameProps {
    /** Underlying HTML tag: 'tg-spoiler' (default) or 'span' */
    tagName?: 'tg-spoiler' | 'span';
}
