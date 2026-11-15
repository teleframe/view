/**
 * @fileoverview Horizontal Divider and Rule components for Telegram messages
 * @module @telegram-markup/native/components/divider/divider
 */

import { normalizeInteger } from '../../sanitizer';
import type { TelegramNativeElement } from '../../tags/base';
import type { NativeDividerProps } from './types';

/**
 * Horizontal Divider / Rule for Telegram messages.
 * Supports both JSX `<Divider />` and functional `divider()` / `divider('━', 15)`.
 */
export function Divider(props?: NativeDividerProps): TelegramNativeElement;
export function Divider(char?: string, length?: number): TelegramNativeElement;
export function Divider(
    propsOrChar?: NativeDividerProps | string,
    length?: number,
): TelegramNativeElement {
    if (typeof propsOrChar === 'string' || propsOrChar === undefined) {
        const c = propsOrChar ?? '—';
        const len = normalizeInteger(length, 20, 1, 4096);
        const line = c.repeat(len);
        return <hr char={line} length={1} before={1} after={1} />;
    }
    const {
        char = '—',
        length: rawLen = 20,
        prefix = '',
        suffix = '',
        before,
        after,
        spacing,
    } = propsOrChar;
    const len = normalizeInteger(rawLen, 20, 1, 4096);
    const b = normalizeInteger(before ?? spacing, 1, 0, 100);
    const a = normalizeInteger(after ?? spacing, 1, 0, 100);
    const line = `${prefix}${char.repeat(len)}${suffix}`;

    return <hr char={line} length={1} before={b} after={a} />;
}

/**
 * Functional helper for horizontal divider without JSX: `divider()` or `divider('━', 15)`.
 */
export const divider = (
    charOrProps?: string | NativeDividerProps,
    length?: number,
): TelegramNativeElement => {
    if (typeof charOrProps === 'object' && charOrProps !== null) {
        return Divider(charOrProps);
    }
    return Divider(charOrProps, length);
};

/**
 * Alias for `<Divider>`.
 */
export const Hr = Divider;

/**
 * Functional alias for `divider`.
 */
export const hr = divider;

export default Divider;
