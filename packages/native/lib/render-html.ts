/**
 * @fileoverview HTML serializer for Telegram Bot API messages (parse_mode: 'HTML')
 * @module @teleframe/view/native/render-html
 */

import { RAW_HTML_TYPE } from './components/raw-html';
import {
    escapeAttr,
    escapeHtml,
    filterTelegramAttributes,
    normalizeInteger,
    TELEGRAM_ALLOWED_TAGS,
} from './sanitizer';
import type { NativeChildren, TelegramNativeElement } from './tags';
import { resolveTree } from './tree';
import { validateCaptionLength, validateMessageLength } from './validation/limits';
import { validateNesting } from './validation/nesting';

export interface RenderToStringOptions {
    /** Validate output length against Telegram Bot API limits */
    validate?: 'message' | 'caption' | false;
}

export const renderToString = (
    node: NativeChildren | TelegramNativeElement<any> | any,
    options?: RenderToStringOptions,
): string => {
    const resolved = resolveTree(node);
    validateNesting(resolved);

    const serialize = (child: unknown): string => {
        if (child === null || child === undefined || typeof child === 'boolean') {
            return '';
        }
        if (typeof child === 'string') return escapeHtml(child);
        if (typeof child === 'number') return String(child);
        if (Array.isArray(child)) return child.map(serialize).join('');

        if (typeof child === 'object' && child && 'type' in (child as Record<string, unknown>)) {
            const el = child as { type: unknown; props?: Record<string, unknown> };

            if (typeof el.type === 'function') {
                return serialize((el.type as (p: unknown) => unknown)(el.props ?? {}));
            }

            if (el.type === RAW_HTML_TYPE) {
                return String(el.props?.html ?? '');
            }

            if (typeof el.type === 'string') {
                const tagName = el.type.toLowerCase();
                const props = el.props ?? {};

                if (tagName === 'br') {
                    const count = normalizeInteger(props.count ?? props.lines, 1, 1, 100);
                    return (props.as === 'br' ? '<br>' : '\n').repeat(count);
                }

                if (tagName === 'hr') {
                    const char = escapeHtml(String(props.char ?? '—'));
                    const length = normalizeInteger(props.length, 20, 1, 4096);
                    const before = '\n'.repeat(normalizeInteger(props.before, 1, 0, 100));
                    const after = '\n'.repeat(normalizeInteger(props.after, 1, 0, 100));
                    return `${before}${char.repeat(length)}${after}`;
                }

                if (tagName === 'li') {
                    const marker = escapeHtml(String(props.marker ?? '• '));
                    const indentStr = '  '.repeat(normalizeInteger(props.indent, 0, 0, 100));
                    return `${indentStr}${marker}${serialize(props.children)}\n`;
                }

                if (tagName === 'p') {
                    const count = normalizeInteger(
                        props.after ?? props.spacing ?? props.lines ?? props.count,
                        2,
                        0,
                        100,
                    );
                    const before = '\n'.repeat(normalizeInteger(props.before, 0, 0, 100));
                    return `${before}${serialize(props.children)}${'\n'.repeat(count)}`;
                }

                const filteredAttrs = filterTelegramAttributes(tagName, props);
                let attrs = '';
                for (const [key, val] of Object.entries(filteredAttrs)) {
                    if (val === true) attrs += ` ${key}`;
                    else if (typeof val === 'string') attrs += ` ${key}="${escapeAttr(val)}"`;
                }

                const inner = serialize(props.children);

                if (tagName === 'span') {
                    return filteredAttrs.class === 'tg-spoiler'
                        ? `<span class="tg-spoiler">${inner}</span>`
                        : inner;
                }

                if (TELEGRAM_ALLOWED_TAGS.has(tagName)) {
                    return `<${tagName}${attrs}>${inner}</${tagName}>`;
                }

                return inner;
            }
        }

        return '';
    };

    const output = serialize(resolved);

    if (options?.validate === 'message') {
        validateMessageLength(output, { isHtml: true });
    } else if (options?.validate === 'caption') {
        validateCaptionLength(output, { isHtml: true });
    }

    return output;
};

export const renderHTML = renderToString;
export const renderHtml = renderToString;
export const renderToHtml = renderToString;
