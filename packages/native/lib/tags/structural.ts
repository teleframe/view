/**
 * @fileoverview Structural, layout, and link tag interfaces for Telegram Bot API
 * @module @teleframe/view/native/tags/structural
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

export interface NativeDefaultLinkTagProps {
    href: string;
    children?: NativeChildren;
    key?: string | number | null;
}

export interface NativeUserLinkTagProps {
    id: number | string | bigint;
    children?: NativeChildren;
    key?: string | number | null;
}

export interface NativeEmojiTagProps {
    'emoji-id': string | number | bigint;
    children?: EmojiChildren;
    key?: string | number | null;
}

export type NativeTgEmojiTagProps = NativeEmojiTagProps;

export interface NativeTgTimeTagProps {
    unix: string | number | bigint;
    format?: TimeFormat;
    children?: TimeChildren;
    key?: string | number | null;
}

export interface NativeMonoTagProps {
    children?: CodeChildren;
    key?: string | number | null;
}

export interface NativeCodeTagProps {
    language?: Language;
    class?: string;
    className?: string;
    children?: CodeChildren;
    key?: string | number | null;
}

export interface NativeCodeblockTagProps {
    language?: Language;
    children?: NativeChildren;
    key?: string | number | null;
}

export interface NativePreTagProps {
    language?: Language;
    children?: NativeChildren;
    key?: string | number | null;
}

export interface NativeBlockquoteTagProps {
    expandable?: boolean;
    children?: NativeChildren;
    key?: string | number | null;
}

export interface NativeBrTagProps {
    count?: number;
    lines?: number;
    as?: 'newline' | 'br';
}

export interface NativeHrTagProps {
    char?: string;
    length?: number;
    before?: number;
    after?: number;
}

export interface NativeLiTagProps extends BaseNativeTagProps {
    marker?: string;
    indent?: number;
}

export interface NativeParagraphTagProps extends BaseNativeTagProps {
    spacing?: number;
    lines?: number;
    count?: number;
    after?: number;
    before?: number;
}
