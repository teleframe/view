/**
 * @fileoverview Intrinsic HTML tag property interfaces for Telegram Bot API formatting
 * @module @telegram-markup/native/tags/intrinsic
 */

import type {
    BaseNativeTagProps,
    CodeChildren,
    EmojiChildren,
    NativeChildren,
    TimeChildren,
} from './base';
import type { Language } from './languages';
import type { TimeFormat } from './time';

/**
 * Properties for intrinsic `<b>` bold formatting tag.
 */
export interface NativeBTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<strong>` bold formatting tag.
 */
export interface NativeStrongTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<i>` italic formatting tag.
 */
export interface NativeITagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<em>` italic formatting tag.
 */
export interface NativeEmTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<u>` underline formatting tag.
 */
export interface NativeUTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<ins>` underline formatting tag.
 */
export interface NativeInsTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<s>` strikethrough formatting tag.
 */
export interface NativeSTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<strike>` strikethrough formatting tag.
 */
export interface NativeStrikeTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<del>` strikethrough formatting tag.
 */
export interface NativeDelTagProps extends BaseNativeTagProps {}

/**
 * Properties for intrinsic `<tg-spoiler>` spoiler tag.
 */
export interface NativeTgSpoilerTagProps extends BaseNativeTagProps {}

/**
 * Properties for alternative `<span class="tg-spoiler">` spoiler tag.
 */
export interface NativeSpoilerSpanTagProps extends BaseNativeTagProps {
    /** CSS class attribute must be 'tg-spoiler' */
    class?: 'tg-spoiler';
    /** Alternative React-like className attribute */
    className?: 'tg-spoiler';
}

/**
 * Properties for intrinsic `<a href="...">` web hyperlink tag.
 */
export interface NativeDefaultLinkTagProps {
    /** Target web URL */
    href: string;
    children?: NativeChildren;
    key?: string | number | null;
}

/**
 * Properties for intrinsic `<a id="...">` user mention link tag (transforms to `tg://user?id=...`).
 */
export interface NativeUserLinkTagProps {
    /** Telegram user ID */
    id: number | string | bigint;
    children?: NativeChildren;
    key?: string | number | null;
}

/**
 * Properties for custom animated or static emoji tag `<tg-emoji emoji-id="...">`.
 */
export interface NativeEmojiTagProps {
    /** Unique Telegram custom emoji identifier */
    'emoji-id': string | number | bigint;
    /** Fallback emoji character */
    children?: EmojiChildren;
    key?: string | number | null;
}

/**
 * Alias for `NativeEmojiTagProps`.
 */
export type NativeTgEmojiTagProps = NativeEmojiTagProps;

/**
 * Properties for native formatted date & time tag `<tg-time unix="..." format="...">`.
 */
export interface NativeTgTimeTagProps {
    /** Unix timestamp in seconds or milliseconds */
    unix: string | number | bigint;
    /** Format pattern or human-readable alias (e.g. 'relative', 'full', 'r', 'wDT') */
    format?: TimeFormat;
    /** Fallback plain text representation */
    children?: TimeChildren;
    key?: string | number | null;
}

/**
 * Properties for inline monospace `<mono>` tag (transforms to `<code>...</code>`).
 */
export interface NativeMonoTagProps {
    /** Monospaced text content only */
    children?: CodeChildren;
    key?: string | number | null;
}

/**
 * Properties for inline code `<code>` tag.
 */
export interface NativeCodeTagProps {
    /** Optional language syntax identifier */
    language?: Language;
    /** Language CSS class (e.g. 'language-typescript') */
    class?: string;
    /** Alternative React-like className attribute */
    className?: string;
    /** Code content (text only; formatting tags are forbidden) */
    children?: CodeChildren;
    key?: string | number | null;
}

/**
 * Properties for multi-line `<codeblock>` tag (transforms to `<pre><code class="language-...">`).
 */
export interface NativeCodeblockTagProps {
    /** Optional programming language for syntax highlighting */
    language?: Language;
    children?: NativeChildren;
    key?: string | number | null;
}

/**
 * Properties for preformatted code block `<pre>` tag.
 */
export interface NativePreTagProps {
    /** Optional programming language for syntax highlighting */
    language?: Language;
    children?: NativeChildren;
    key?: string | number | null;
}

/**
 * Properties for quote block `<blockquote>` tag.
 */
export interface NativeBlockquoteTagProps {
    /** Whether the blockquote can be collapsed/expanded by user */
    expandable?: boolean;
    children?: NativeChildren;
    key?: string | number | null;
}

/**
 * Properties for line break tag `<br />`.
 */
export interface NativeBrTagProps {
    /** Number of consecutive line breaks to render */
    count?: number;
    /** Alias for `count` */
    lines?: number;
    /** Format of line break: newline character `\n` or `<br/>` HTML tag */
    as?: 'newline' | 'br';
}

/**
 * Properties for horizontal rule / divider tag `<hr />`.
 */
export interface NativeHrTagProps {
    /** Repeating character used to draw divider */
    char?: string;
    /** Divider length in characters */
    length?: number;
    /** Blank lines before divider */
    before?: number;
    /** Blank lines after divider */
    after?: number;
}

/**
 * Properties for list item tag `<li>`.
 */
export interface NativeLiTagProps extends BaseNativeTagProps {
    /** Custom marker or bullet character */
    marker?: string;
    /** Indentation level in 2-space increments */
    indent?: number;
}

/**
 * Properties for intrinsic virtual paragraph tag `<p>`.
 */
export interface NativeParagraphTagProps extends BaseNativeTagProps {
    /** Number of consecutive line breaks after paragraph (default: 2) */
    spacing?: number;
    /** Alias for `spacing` */
    lines?: number;
    /** Alias for `spacing` */
    count?: number;
    /** Number of line breaks after paragraph (default: 2) */
    after?: number;
    /** Number of line breaks before paragraph (default: 0) */
    before?: number;
}
