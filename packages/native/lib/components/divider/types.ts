/**
 * @fileoverview Type definitions for Horizontal Divider and Rule components
 * @module @teleframe/view/native/components/divider/types
 */

/**
 * Properties for `<Divider>` and `<Hr>` horizontal divider components.
 */
export interface NativeDividerProps {
    /** Repeating character used to draw the divider (default: '—') */
    char?: string;
    /** Number of times the character is repeated (default: 20) */
    length?: number;
    /** Optional prefix text placed before the line */
    prefix?: string;
    /** Optional suffix text placed after the line */
    suffix?: string;
    /** Number of empty lines preceding the divider (default: 1) */
    before?: number;
    /** Number of empty lines following the divider (default: 1) */
    after?: number;
    /** Shortcut setting both `before` and `after` line breaks simultaneously */
    spacing?: number;
}

/**
 * Alias for `NativeDividerProps`.
 */
export type NativeHrProps = NativeDividerProps;
