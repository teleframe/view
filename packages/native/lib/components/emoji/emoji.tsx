/**
 * @fileoverview Custom emoji component and function for Telegram messages
 * @module @telegram-markup/native/components/emoji/emoji
 */

import type { EmojiChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeEmojiProps } from './types';

/**
 * Custom animated emoji component rendering `<tg-emoji>`.
 * Supports both JSX usage `<Emoji id="...">👍</Emoji>` and functional usage `emoji(id, fallback)`.
 */
export function Emoji(props: NativeEmojiProps): TelegramNativeElement;
export function Emoji(
    id: string | number | bigint,
    fallback?: EmojiChildren,
): TelegramNativeElement;
export function Emoji(
    propsOrId: NativeEmojiProps | string | number | bigint,
    fallback?: EmojiChildren,
): TelegramNativeElement {
    if (typeof propsOrId === 'object' && propsOrId !== null) {
        return <tg-emoji emoji-id={propsOrId.id}>{propsOrId.children}</tg-emoji>;
    }
    return <tg-emoji emoji-id={propsOrId}>{fallback}</tg-emoji>;
}

/**
 * Functional helper for custom emoji without JSX: `emoji('5368324170671202286', '👍')`.
 */
export const emoji = Emoji;

export default Emoji;
