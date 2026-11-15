/**
 * @fileoverview Type definitions for Blockquote component
 * @module @teleframe/view/native/components/blockquote/types
 */

import type { NativeChildren } from '../../tags/base';

/**
 * Properties for `<Blockquote>` quotation component.
 */
export interface NativeBlockquoteProps {
    /** Whether the blockquote is expandable / collapsible by the user in Telegram */
    expandable?: boolean;
    children?: NativeChildren;
    key?: string | number | null;
}
