/**
 * @fileoverview Type definitions for Link component
 * @module @teleframe/view/native/components/link/types
 */

import type { NativeChildren } from '@native/tags/base';

interface BaseLinkProps {
    children?: NativeChildren;
    key?: string | number | null;
}

/**
 * Properties for `<Link>` component supporting URLs or direct user IDs.
 */
export type NativeLinkProps =
    | (BaseLinkProps & {
          /** Target web URL */
          href: string;
          /** Telegram user ID cannot be passed with href */
          userId?: never;
      })
    | (BaseLinkProps & {
          /** Telegram user ID to create inline mention */
          userId: number | string | bigint;
          /** Web URL cannot be passed with userId */
          href?: never;
      });
