/**
 * @fileoverview Hyperlink and user mention component and function for Telegram messages
 * @module @teleframe/view/native/components/link/link
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
import { User } from '../user';
import type { NativeLinkProps } from './types';

/**
 * Hyperlink and user mention component.
 * Supports both JSX usage `<Link href="...">label</Link>` and functional usage `link(href, label)`.
 */
export function Link(props: NativeLinkProps): TelegramNativeElement;
export function Link(
    hrefOrUserId: string | number | bigint,
    children: NativeChildren,
): TelegramNativeElement;
export function Link(
    propsOrTarget: NativeLinkProps | string | number | bigint,
    children?: NativeChildren,
): TelegramNativeElement {
    if (typeof propsOrTarget === 'object' && propsOrTarget !== null) {
        const { children: c, href, userId } = propsOrTarget as NativeLinkProps;
        if (userId !== undefined) {
            return User({ id: userId, children: c });
        }
        if (!href) {
            throw new Error('[Telegram Markup] <Link> requires either an "href" or "userId" prop.');
        }
        return {
            type: 'a',
            props: { href, children: c },
        };
    }

    if (typeof propsOrTarget === 'number' || typeof propsOrTarget === 'bigint') {
        return User({ id: propsOrTarget, children });
    }

    if (typeof propsOrTarget === 'string') {
        if (!propsOrTarget.trim()) {
            throw new Error('[Telegram Markup] <Link> requires a non-empty "href" prop.');
        }
        return {
            type: 'a',
            props: { href: propsOrTarget, children },
        };
    }

    throw new Error('[Telegram Markup] link requires target URL string or userId number.');
}

/**
 * Functional helper for links without JSX: `link('https://example.com', 'Click here')`.
 */
export const link = Link;

export default Link;
