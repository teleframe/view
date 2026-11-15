/**
 * @fileoverview High-DX Collection mapping component for Telegram messages
 * @module @teleframe/view/native/components/each/each
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import { Br } from '../br';
import { Li, Ol, Ul } from '../list';
import type { NativeEachProps } from './types';

/**
 * High-DX Collection mapping component for Telegram messages.
 *
 * Supports plain mapping with customizable separators (defaulting to `<Br />`),
 * and automatic list rendering (`as="ul"` or `as="ol"`).
 *
 * @template T - Item type
 * @param props - Iterator options and callbacks
 * @returns Rendered elements or fallback
 *
 * @example
 * ```tsx
 * // 1. Plain iteration with default <Br /> separator
 * <Each items={['Item 1', 'Item 2', 'Item 3']} />
 *
 * // 2. Typed item render callback
 * <Each items={users}>
 *   {(user, index) => <b>{index + 1}. {user.name}</b>}
 * </Each>
 *
 * // 3. Automatic Unordered List
 * <Each items={fruits} as="ul" marker="—">
 *   {(fruit) => <i>{fruit}</i>}
 * </Each>
 * ```
 */
export const Each = <T = any>(props: NativeEachProps<T>): TelegramNativeElement | any => {
    const {
        items,
        as = 'plain',
        render,
        children,
        fallback = null,
        separator = Br(),
        marker,
        start = 1,
        spacing = 1,
        numberStyle = 'dot',
    } = props;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return fallback ?? null;
    }

    const renderFn: (item: T, index: number) => NativeChildren =
        typeof children === 'function'
            ? (children as (item: T, index: number) => NativeChildren)
            : typeof render === 'function'
              ? render
              : (item: T) => item as unknown as NativeChildren;

    if (as === 'ul') {
        const listChildren = items.map((item, index) => {
            const content = renderFn(item, index);
            const itemMarker = typeof marker === 'function' ? marker(index, item) : marker;
            return Li({
                key: index,
                marker: itemMarker,
                children: content,
            });
        });
        return Ul({
            bullet: typeof marker === 'string' ? marker : undefined,
            spacing,
            children: listChildren,
        });
    }

    if (as === 'ol') {
        const listChildren = items.map((item, index) => {
            const content = renderFn(item, index);
            const itemMarker = typeof marker === 'function' ? marker(index, item) : marker;
            return Li({
                key: index,
                marker: itemMarker,
                children: content,
            });
        });
        return Ol({
            start,
            numberStyle,
            spacing,
            children: listChildren,
        });
    }

    const result: any[] = [];
    for (let i = 0; i < items.length; i++) {
        result.push(renderFn(items[i], i));
        if (
            i < items.length - 1 &&
            separator !== null &&
            separator !== undefined &&
            separator !== false
        ) {
            result.push(separator);
        }
    }

    return result;
};

/**
 * Functional helper for collection iteration without JSX.
 */
export const each = <T = any>(props: NativeEachProps<T>): TelegramNativeElement | any =>
    Each(props);

export default Each;
