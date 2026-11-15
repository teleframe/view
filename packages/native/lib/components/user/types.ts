/**
 * @fileoverview Type definitions for User mention component
 * @module @teleframe/view/native/components/user/types
 */

import type { NativeChildren } from '../../tags/base';

/**
 * Properties for `<User>` mention component.
 */
export interface NativeUserProps {
    /** Telegram user ID to link to */
    id: number | string | bigint;
    children?: NativeChildren;
    key?: string | number | null;
}
