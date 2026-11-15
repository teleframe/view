/**
 * @fileoverview Main rendering engine for @teleframe/view/native:
 * - render(): Primary compiler returning { text, entities } (Telegram Bot API MessageEntity[])
 * - renderToString() / renderHTML(): Alternative serializer returning compliant Telegram HTML string
 * @module @teleframe/view/native/render
 */

import { compileToEntities, type MessageEntity, type RenderResult } from './entities';
import {
    renderHtml,
    renderHTML,
    renderToHtml,
    renderToString,
    type RenderToStringOptions,
} from './render-html';
import type { NativeChildren, TelegramNativeElement } from './tags';
import { validateCaptionLength, validateMessageLength } from './validation/limits';

export { escapeAttr, escapeHtml } from './sanitizer';
export type { MessageEntity, RenderResult } from './entities';
export { renderHtml, renderHTML, renderToHtml, renderToString, type RenderToStringOptions };

export interface RenderOptions {
    /** Validate output length against Telegram Bot API limits */
    validate?: 'message' | 'caption' | false;
}

/**
 * Primary compiler for Telegram messages.
 * Compiles JSX elements directly into text and Telegram Bot API MessageEntity array.
 */
export const render = (
    node: NativeChildren | TelegramNativeElement<any> | any,
    options?: RenderOptions,
): RenderResult => {
    const result = compileToEntities(node);

    if (options?.validate === 'message') {
        validateMessageLength(result);
    } else if (options?.validate === 'caption') {
        validateCaptionLength(result);
    }

    return result;
};

export default render;
