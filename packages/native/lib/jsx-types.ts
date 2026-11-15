/**
 * @fileoverview JSX namespace and intrinsic element declarations for Telegram Native JSX runtime
 * @module @teleframe/view/native/jsx-runtime/types
 */

import type {
    NativeBlockquoteTagProps,
    NativeBrTagProps,
    NativeBTagProps,
    NativeCodeblockTagProps,
    NativeCodeTagProps,
    NativeDefaultLinkTagProps,
    NativeDelTagProps,
    NativeEmojiTagProps,
    NativeEmTagProps,
    NativeHrTagProps,
    NativeInsTagProps,
    NativeITagProps,
    NativeLiTagProps,
    NativeMonoTagProps,
    NativeParagraphTagProps,
    NativePreTagProps,
    NativeSpoilerSpanTagProps,
    NativeSTagProps,
    NativeStrikeTagProps,
    NativeStrongTagProps,
    NativeTgEmojiTagProps,
    NativeTgSpoilerTagProps,
    NativeTgTimeTagProps,
    NativeUserLinkTagProps,
    NativeUTagProps,
    TelegramNativeElement,
} from './tags';

export namespace JSX {
    /**
     * Return element type for Telegram Native JSX expressions.
     */
    export type Element = TelegramNativeElement;

    /**
     * Children attribute configuration for JSX compiler.
     */
    export interface ElementChildrenAttribute {
        children: {};
    }

    /**
     * Intrinsic HTML tags recognized by Telegram Bot API HTML formatting mode.
     */
    export interface IntrinsicElements {
        // Bold
        b: NativeBTagProps;
        strong: NativeStrongTagProps;

        // Italic
        i: NativeITagProps;
        em: NativeEmTagProps;

        // Underline
        u: NativeUTagProps;
        ins: NativeInsTagProps;

        // Strikethrough
        s: NativeSTagProps;
        strike: NativeStrikeTagProps;
        del: NativeDelTagProps;

        // Spoiler
        'tg-spoiler': NativeTgSpoilerTagProps;
        span: NativeSpoilerSpanTagProps;

        // Links & Mentions
        a: NativeDefaultLinkTagProps;
        user: NativeUserLinkTagProps;

        // Custom Emoji
        'tg-emoji': NativeEmojiTagProps;

        // Formatted Date & Time
        'tg-time': NativeTgTimeTagProps;

        // Inline Monospace
        mono: NativeMonoTagProps;

        // Code & Pre (monospaced & syntax highlighted)
        code: NativeCodeTagProps;
        codeblock: NativeCodeblockTagProps;
        pre: NativePreTagProps;

        // Blockquote (supports expandable)
        blockquote: NativeBlockquoteTagProps;

        // Line Break
        br: NativeBrTagProps;

        // Horizontal Rule
        hr: NativeHrTagProps;

        // List Item
        li: NativeLiTagProps;

        // Virtual Paragraph (auto line break separation)
        p: NativeParagraphTagProps;
    }
}
