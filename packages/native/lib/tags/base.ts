/**
 * @fileoverview Core foundational types for Telegram Native JSX Element Tree
 * @module @telegram-markup/native/tags/base
 */

/**
 * Primitive text or scalar child.
 */
export type TextOnlyChild = string | number | boolean | null | undefined;

/**
 * Representation of a virtual Telegram Native element produced by JSX runtime.
 *
 * @template P - Element props type
 */
export interface TelegramNativeElement<P = any> {
    /** Tag name string (e.g., 'b', 'code') or component function */
    type: string | ((props: P) => unknown);
    /** Component properties */
    props: P;
    /** Optional key for list rendering */
    key?: string | number | null;
}

/**
 * Permitted children inside preformatted inline <code> and <mono>: only plain text or numbers.
 * Formatting tags are forbidden by Telegram Bot API.
 */
export type CodeChildren = TextOnlyChild | TextOnlyChild[];

/**
 * Permitted children inside formatted date/time fallback: text only.
 */
export type TimeChildren = TextOnlyChild | TextOnlyChild[];

/**
 * Permitted children inside custom emoji tag: single emoji text.
 */
export type EmojiChildren = string;

/**
 * Generic Telegram JSX child: primitive scalars, virtual elements, or render callbacks.
 */
export type NativeChild = TextOnlyChild | TelegramNativeElement | ((...args: any[]) => unknown);

/**
 * Single or nested array of acceptable children in Telegram JSX.
 */
export type NativeChildren = NativeChild | NativeChild[];

/**
 * Base properties shared by standard native Telegram tags.
 */
export interface BaseNativeTagProps {
    children?: NativeChildren;
    key?: string | number | null;
}

/**
 * Base properties for components that allow switching between alternative HTML tags.
 */
export interface BaseNativeTagWithTagNameProps {
    children?: NativeChildren;
    tagName?: string;
    key?: string | number | null;
}
