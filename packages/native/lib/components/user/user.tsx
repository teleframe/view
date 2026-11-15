/**
 * @fileoverview User mention component and function for Telegram messages
 * @module @telegram-markup/native/components/user/user
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeUserProps } from './types';

/**
 * User mention component rendering `<user id="...">`.
 * Supports both JSX usage `<User id={123}>Name</User>` and functional usage `user(123, 'Name')`.
 */
export function User(props: NativeUserProps): TelegramNativeElement;
export function User(
    id: number | string | bigint,
    children?: NativeChildren,
): TelegramNativeElement;
export function User(
    propsOrId: NativeUserProps | number | string | bigint,
    children?: NativeChildren,
): TelegramNativeElement {
    let id: unknown;
    let c: NativeChildren | undefined;
    if (typeof propsOrId === 'object' && propsOrId !== null) {
        id = (propsOrId as NativeUserProps).id;
        c = (propsOrId as NativeUserProps).children;
    } else {
        id = propsOrId;
        c = children;
    }

    if (id === undefined || id === null || String(id).trim() === '') {
        throw new Error('[Telegram Markup] <User> requires a valid "id" prop.');
    }
    const numId = Number(id);
    if (!Number.isSafeInteger(numId) || numId <= 0) {
        throw new Error(
            `[Telegram Markup] Invalid user ID: "${id}". Telegram user ID must be a positive integer.`,
        );
    }

    return <a href={`tg://user?id=${numId}`}>{c}</a>;
}

/**
 * Functional helper for user mentions without JSX: `user(123456789, 'Alice')`.
 */
export const user = User;

export default User;
