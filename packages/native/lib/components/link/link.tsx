/**
 * @fileoverview Hyperlink and user mention component and function for Telegram messages
 * @module @telegram-markup/native/components/link/link
 */

import type { NativeChildren, TelegramNativeElement } from '../../tags/base';
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
            return <user id={userId}>{c}</user>;
        }
        if (!href) {
            throw new Error('[Telegram Markup] <Link> requires either an "href" or "userId" prop.');
        }
        return <a href={href}>{c}</a>;
    }

    if (typeof propsOrTarget === 'number' || typeof propsOrTarget === 'bigint') {
        return <user id={propsOrTarget}>{children}</user>;
    }

    if (typeof propsOrTarget === 'string') {
        return <a href={propsOrTarget}>{children}</a>;
    }

    throw new Error('[Telegram Markup] link requires target URL string or userId number.');
}

/**
 * Functional helper for links without JSX: `link('https://example.com', 'Click here')`.
 */
export const link = Link;

export default Link;
