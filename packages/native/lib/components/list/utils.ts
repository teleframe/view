/**
 * @fileoverview Number formatters, bullet presets, and flattening utilities for lists
 * @module @telegram-markup/native/components/list/utils
 */

import type { NumberStyle } from './types';

/**
 * Flattens nested children arrays or removes falsy elements.
 *
 * @param children - Raw nested children
 * @returns Flattened array of active items
 */
export const flattenChildren = (children: any): any[] => {
    if (children === null || children === undefined || typeof children === 'boolean') {
        return [];
    }
    if (Array.isArray(children)) {
        return children.flatMap(flattenChildren);
    }
    return [children];
};

/**
 * Converts a positive integer to Roman numerals string.
 *
 * @param num - Positive integer
 * @returns Roman numeral string (e.g. 'I', 'IV', 'X')
 */
export const toRoman = (num: number): string => {
    const lookup: [number, string][] = [
        [1000, 'M'],
        [900, 'CM'],
        [500, 'D'],
        [400, 'CD'],
        [100, 'C'],
        [90, 'XC'],
        [50, 'L'],
        [40, 'XL'],
        [10, 'X'],
        [9, 'IX'],
        [5, 'V'],
        [4, 'IV'],
        [1, 'I'],
    ];
    let roman = '';
    let n = num;
    for (const [val, sym] of lookup) {
        while (n >= val) {
            roman += sym;
            n -= val;
        }
    }
    return roman || 'I';
};

/**
 * Converts a 1-based index to lowercase Latin alphabetical letter ('a', 'b', ...).
 *
 * @param num - 1-based index
 * @returns Alphabetical character
 */
export const toAlpha = (num: number): string => {
    const code = 96 + (((num - 1) % 26) + 1);
    return String.fromCharCode(code);
};

/**
 * Formats a number with the chosen list numbering style.
 *
 * @param num - Current index
 * @param style - Formatting style ('dot', 'paren', 'roman', 'alpha')
 * @returns Formatted marker string with trailing space
 */
export const formatNumberMarker = (num: number, style: NumberStyle = 'dot'): string => {
    switch (style) {
        case 'paren':
            return `${num}) `;
        case 'roman':
            return `${toRoman(num)}. `;
        case 'alpha':
            return `${toAlpha(num)}. `;
        case 'dot':
        default:
            return `${num}. `;
    }
};

/**
 * Common bullet character presets for unordered lists.
 */
export const BULLET_PRESETS: Record<string, string> = {
    bullet: '• ',
    dash: '— ',
    hyphen: '- ',
    star: '* ',
    circle: '○ ',
    check: '✅ ',
    cross: '❌ ',
    arrow: '👉 ',
    pointer: '▸ ',
};
