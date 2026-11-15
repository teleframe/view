/**
 * @fileoverview Line break components for Telegram messages
 * @module @teleframe/view/native/components/br/br
 */

import type { TelegramNativeElement } from '@native/tags/base';
import type { NativeBrProps } from './types';

/**
 * Line break component for Telegram formatted text.
 * Supports both JSX usage `<Br count={2} />` and functional usage `Br(2)` or `Br()`.
 */
export function Br(props?: NativeBrProps): TelegramNativeElement;
export function Br(count?: number): TelegramNativeElement;
export function Br(propsOrCount?: NativeBrProps | number): TelegramNativeElement {
    if (typeof propsOrCount === 'number') {
        return <br count={propsOrCount} as="newline" />;
    }
    const { count = 1, lines, as = 'newline' } = propsOrCount ?? {};
    return <br count={lines ?? count} as={as} />;
}

/**
 * Functional helper for line breaks without JSX: `br()`, `br(2)`.
 */
export const br = (count?: number | NativeBrProps): TelegramNativeElement => {
    return typeof count === 'number' ? Br(count) : Br(count);
};

/**
 * Alias for `<Br>`.
 */
export const Break = Br;

/**
 * Functional alias for `br`.
 */
export const breakLine = br;

/**
 * Alias for `<Br>`.
 */
export const NewLine = Br;

/**
 * Functional alias for `br`.
 */
export const newLine = br;

export default Br;
