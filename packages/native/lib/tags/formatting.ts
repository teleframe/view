/**
 * @fileoverview Formatting tag property interfaces for Telegram Bot API
 * @module @teleframe/view/native/tags/formatting
 */

import type { BaseNativeTagProps } from './base';

export interface NativeBTagProps extends BaseNativeTagProps {}
export interface NativeStrongTagProps extends BaseNativeTagProps {}

export interface NativeITagProps extends BaseNativeTagProps {}
export interface NativeEmTagProps extends BaseNativeTagProps {}

export interface NativeUTagProps extends BaseNativeTagProps {}
export interface NativeInsTagProps extends BaseNativeTagProps {}

export interface NativeSTagProps extends BaseNativeTagProps {}
export interface NativeStrikeTagProps extends BaseNativeTagProps {}
export interface NativeDelTagProps extends BaseNativeTagProps {}

export interface NativeTgSpoilerTagProps extends BaseNativeTagProps {}
export interface NativeSpoilerSpanTagProps extends BaseNativeTagProps {
    class?: 'tg-spoiler';
    className?: 'tg-spoiler';
}
