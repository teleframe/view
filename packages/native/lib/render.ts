/**
 * @fileoverview Main rendering engine for @telegram-markup/native:
 * - render(): Primary compiler returning { text, entities } (Telegram Bot API MessageEntity[])
 * - renderToString() / renderHTML(): Alternative serializer returning compliant Telegram HTML string
 * @module @telegram-markup/native/render
 */

import { RAW_HTML_TYPE } from './components/raw-html';
import { compileToEntities, type MessageEntity, type RenderResult } from './entities';
import {
    escapeAttr,
    escapeHtml,
    filterTelegramAttributes,
    TELEGRAM_ALLOWED_TAGS,
} from './sanitizer';
import type { NativeChildren, TelegramNativeElement } from './tags';
import { validateCaptionLength, validateMessageLength } from './validation/limits';
import { validateNesting } from './validation/nesting';

export { escapeAttr, escapeHtml } from './sanitizer';
export type { MessageEntity, RenderResult } from './entities';

export interface RenderOptions {
    /** Validate output length against Telegram Bot API limits */
    validate?: 'message' | 'caption' | false;
}

export interface RenderToStringOptions {
    /** Validate output length against Telegram Bot API limits */
    validate?: 'message' | 'caption' | false;
}

/**
 * Primary compiler for Telegram messages.
 * Compiles JSX elements directly into text and Telegram Bot API MessageEntity array.
 *
 * @param node - Telegram JSX tree
 * @param options - Compilation and validation options
 * @returns {RenderResult} Object containing `text` and `entities`
 *
 * @example
 * ```tsx
 * const { text, entities } = render(
 *   <Bold>🚀 System Update</Bold>
 * );
 * await ctx.reply(text, { entities });
 * ```
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

/**
 * Alternative HTML serializer for Telegram messages.
 * Serializes JSX elements into a sanitized Telegram Bot API HTML string for `parse_mode: 'HTML'`.
 *
 * @param node - Telegram JSX tree
 * @param options - Serialization and validation options
 * @returns {string} Sanitized Telegram HTML string
 *
 * @example
 * ```tsx
 * const html = renderToString(<Bold>Hello World</Bold>);
 * await ctx.reply(html, { parse_mode: 'HTML' });
 * ```
 */
export const renderToString = (
    node: NativeChildren | TelegramNativeElement<any> | any,
    options?: RenderToStringOptions,
): string => {
    // 1. Validate tree nesting before serialization
    validateNesting(node);

    const serialize = (child: unknown): string => {
        if (child === null || child === undefined || typeof child === 'boolean') {
            return '';
        }

        if (typeof child === 'string') {
            return escapeHtml(child);
        }

        if (typeof child === 'number') {
            return String(child);
        }

        if (Array.isArray(child)) {
            return child.map(serialize).join('');
        }

        if (typeof child === 'object' && child && 'type' in (child as Record<string, unknown>)) {
            const el = child as { type: unknown; props?: Record<string, unknown> };

            // 1. Function component: execute component function
            if (typeof el.type === 'function') {
                const result = (el.type as (p: unknown) => unknown)(el.props ?? {});
                return serialize(result);
            }

            // 2. Explicit RawHtml escape hatch
            if (el.type === RAW_HTML_TYPE) {
                return String(el.props?.html ?? '');
            }

            // 3. Intrinsic HTML / Telegram tag
            if (typeof el.type === 'string') {
                const tagName = el.type.toLowerCase();
                const props = el.props ?? {};

                // Special handling for <br count={2} as="br"|"newline" />
                if (tagName === 'br') {
                    const count = Math.max(1, (props.count ?? props.lines ?? 1) as number);
                    const symbol = props.as === 'br' ? '<br>' : '\n';
                    return symbol.repeat(count);
                }

                // Special handling for <hr char="—" length={20} />
                if (tagName === 'hr') {
                    const char = escapeHtml(String(props.char ?? '—'));
                    const length = Math.max(1, (props.length ?? 20) as number);
                    const before = '\n'.repeat((props.before ?? 1) as number);
                    const after = '\n'.repeat((props.after ?? 1) as number);
                    return `${before}${char.repeat(length)}${after}`;
                }

                // Special handling for <li> (fallback when not inside <Ul>/<Ol>)
                if (tagName === 'li') {
                    const marker = escapeHtml(String(props.marker ?? '• '));
                    const indent = Math.max(0, (props.indent ?? 0) as number);
                    const indentStr = '  '.repeat(indent);
                    const inner = serialize(props.children);
                    return `${indentStr}${marker}${inner}\n`;
                }

                // Special handling for <p count={2} before={0} /> (virtual paragraph tag)
                if (tagName === 'p') {
                    const count = Math.max(
                        0,
                        (props.after ?? props.spacing ?? props.lines ?? props.count ?? 2) as number,
                    );
                    const beforeCount = Math.max(0, (props.before ?? 0) as number);
                    const inner = serialize(props.children);
                    return `${'\n'.repeat(beforeCount)}${inner}${'\n'.repeat(count)}`;
                }

                // Filter and sanitize attributes according to Telegram whitelist
                const filteredAttrs = filterTelegramAttributes(tagName, props);

                let attrs = '';
                for (const [key, val] of Object.entries(filteredAttrs)) {
                    if (val === true) {
                        attrs += ` ${key}`;
                    } else if (typeof val === 'string') {
                        attrs += ` ${key}="${escapeAttr(val)}"`;
                    }
                }

                const inner = serialize(props.children);

                // Telegram Bot API ONLY supports <span> if it has class="tg-spoiler".
                // Otherwise unwrap and return inner content to prevent 400 Bad Request.
                if (tagName === 'span') {
                    if (filteredAttrs.class === 'tg-spoiler') {
                        return `<span class="tg-spoiler">${inner}</span>`;
                    }
                    return inner;
                }

                // If tagName is whitelisted, wrap in tags; otherwise just return inner content
                if (TELEGRAM_ALLOWED_TAGS.has(tagName)) {
                    return `<${tagName}${attrs}>${inner}</${tagName}>`;
                }

                return inner;
            }
        }

        return '';
    };

    const output = serialize(node);

    if (options?.validate === 'message') {
        validateMessageLength(output);
    } else if (options?.validate === 'caption') {
        validateCaptionLength(output);
    }

    return output;
};

export const renderHTML = renderToString;
export const renderHtml = renderToString;
export const renderToHtml = renderToString;
export default render;
