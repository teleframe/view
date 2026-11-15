/**
 * @fileoverview Custom emoji component and function for Telegram messages
 * @module @teleframe/view/native/components/emoji/emoji
 */

import { TelegramSecurityError } from '@native/sanitizer';
import type { EmojiChildren, TelegramNativeElement } from '@native/tags/base';
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
    let id: unknown;
    let children: EmojiChildren | undefined;
    if (typeof propsOrId === 'object' && propsOrId !== null) {
        id = propsOrId.id;
        children = propsOrId.children;
    } else {
        id = propsOrId;
        children = fallback;
    }

    if (id === undefined || id === null || String(id).trim() === '') {
        throw new TelegramSecurityError('[Telegram Markup] <Emoji> requires a valid "id" prop.');
    }
    const strId = String(id).trim();
    if (!/^\d+$/.test(strId)) {
        throw new TelegramSecurityError(
            `[Telegram Markup] Invalid emoji-id: "${id}". Telegram custom emoji ID must be a numeric string of digits.`,
        );
    }

    return <tg-emoji emoji-id={strId}>{children}</tg-emoji>;
}

/**
 * Functional helper for custom emoji without JSX: `emoji('5368324170671202286', '👍')`.
 */
export const emoji = Emoji;

export default Emoji;
