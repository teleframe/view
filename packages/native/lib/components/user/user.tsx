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
    if (typeof propsOrId === 'object' && propsOrId !== null) {
        return (
            <user id={(propsOrId as NativeUserProps).id}>
                {(propsOrId as NativeUserProps).children}
            </user>
        );
    }
    return <user id={propsOrId}>{children}</user>;
}

/**
 * Functional helper for user mentions without JSX: `user(123456789, 'Alice')`.
 */
export const user = User;

export default User;
