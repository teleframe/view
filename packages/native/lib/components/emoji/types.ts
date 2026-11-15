/**
 * @fileoverview Type definitions for Telegram Custom Emoji component
 * @module @teleframe/view/native/components/emoji/types
 */

import type { EmojiChildren } from '../../tags/base';

/**
 * Properties for `<Emoji>` custom emoji component.
 */
export interface NativeEmojiProps {
    /** Unique Telegram custom emoji identifier */
    id: string | number | bigint;
    /** Fallback emoji character */
    children?: EmojiChildren;
    key?: string | number | null;
}
