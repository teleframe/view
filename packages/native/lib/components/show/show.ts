/**
 * @fileoverview Declarative conditional rendering component for Telegram messages
 * @module @teleframe/view/native/components/show/show
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeShowProps } from './types';

/**
 * Declarative conditional rendering component for Telegram messages.
 *
 * Replaces verbose and error-prone ternary operators (`{cond ? <A /> : <B />}`).
 *
 * @template T - Truthy condition / payload type
 * @param props - Show properties including `when`, `fallback`, and `children`
 * @returns Children, evaluated callback result, or fallback
 *
 * @example
 * ```tsx
 * <Show when={isVip} fallback={<i>Standard User</i>}>
 *   <b>🌟 VIP Member</b>
 * </Show>
 *
 * // Value unwrapping pattern with typed callback:
 * <Show when={user}>
 *   {(u) => <b>Welcome, {u.name}!</b>}
 * </Show>
 * ```
 */
export const Show = <T = any>({
    when,
    fallback = null,
    children,
}: NativeShowProps<T>): TelegramNativeElement | any => {
    if (!when) {
        return fallback ?? null;
    }

    if (typeof children === 'function') {
        return (children as (item: NonNullable<T>) => NativeChildren)(when as NonNullable<T>);
    }

    return children ?? null;
};

/**
 * Functional helper for conditional rendering without JSX.
 */
export const show = <T = any>(props: NativeShowProps<T>): TelegramNativeElement | any =>
    Show(props);

export default Show;
