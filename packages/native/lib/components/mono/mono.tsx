/**
 * @fileoverview Inline monospace formatting component and function for Telegram messages
 * @module @telegram-markup/native/components/mono/mono
 */

import type { CodeChildren, TelegramNativeElement } from '../../tags/base';
import type { NativeMonoProps } from './types';

/**
 * Idiomatic inline monospace alias for `<code>`.
 * Supports both JSX usage `<Mono>text</Mono>` and functional usage `Mono('text')`.
 */
export function Mono(props: NativeMonoProps): TelegramNativeElement;
export function Mono(children: CodeChildren): TelegramNativeElement;
export function Mono(propsOrChildren: NativeMonoProps | CodeChildren): TelegramNativeElement {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        'children' in propsOrChildren
    ) {
        return <mono>{(propsOrChildren as NativeMonoProps).children}</mono>;
    }
    return <mono>{propsOrChildren as CodeChildren}</mono>;
}

/**
 * Functional helper for monospace text without JSX: `mono('token')`.
 */
export const mono = (children: CodeChildren): TelegramNativeElement => Mono(children);

export const Monospace = Mono;
export const monospace = mono;

export default Mono;
