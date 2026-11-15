/**
 * @fileoverview Strict Telegram Native HTML JSX Runtime
 * @module @telegram-markup/native/jsx-runtime
 *
 * Implements native Telegram Bot API HTML tags and transformations:
 * - Direct tags: b, strong, i, em, u, ins, s, strike, del, tg-spoiler, span.tg-spoiler, a, tg-emoji, tg-time, code, pre, blockquote
 * - Virtual <user id={...}> tag transformed into <a href="tg://user?id=...">
 * - Virtual <mono>...</mono> tag transformed into <code>...</code> for inline monospace
 * - <code language="..."> or <pre language="..."> transformed into <pre><code class="language-...">...</code></pre>
 */

import type { NativeChildren, TelegramNativeElement } from './tags/base';
import { normalizeTimeFormat } from './tags/time';

export * from './jsx-runtime/types';
export * from './tags';

/**
 * Creates and transforms a Telegram virtual native JSX element node.
 *
 * @param type - Tag name string or component function
 * @param props - Element properties and children
 * @param key - Optional element key
 * @returns Virtual Telegram native element
 */
export const jsx = (type: any, props: any, key?: any): TelegramNativeElement => {
    // 1. Transform virtual <user id={...}> into Telegram user mention link <a href="tg://user?id=...">
    if (type === 'user') {
        const { id, children, ...rest } = props ?? {};
        if (id === undefined || id === null || String(id).trim() === '') {
            throw new Error('[Telegram Markup] <user> requires a valid "id" prop.');
        }
        const numId = Number(id);
        if (!Number.isSafeInteger(numId) || numId <= 0) {
            throw new Error(
                `[Telegram Markup] Invalid user ID: "${id}". Telegram user ID must be a positive integer.`,
            );
        }
        return {
            type: 'a',
            props: {
                ...rest,
                href: `tg://user?id=${numId}`,
                children,
            },
            key,
        };
    }

    // 2. Transform virtual <mono>...</mono> into Telegram inline <code>...</code>
    if (type === 'mono') {
        return {
            type: 'code',
            props,
            key,
        };
    }

    // 3. Normalize format aliases on <tg-time unix="..." format="...">
    if (type === 'tg-time' && props?.format) {
        const { format, ...rest } = props;
        return {
            type: 'tg-time',
            props: {
                ...rest,
                format: normalizeTimeFormat(format),
            },
            key,
        };
    }

    // 4. Transform virtual <codeblock language="..."> into Telegram code block
    if (type === 'codeblock') {
        const { language, children, ...rest } = props ?? {};
        if (language) {
            return {
                type: 'pre',
                props: {
                    ...rest,
                    children: {
                        type: 'code',
                        props: {
                            class: `language-${language}`,
                            children,
                        },
                    },
                },
                key,
            };
        }
        return {
            type: 'pre',
            props: {
                ...rest,
                children,
            },
            key,
        };
    }

    // 5. Transform <code language="..."> into <pre><code class="language-...">
    if (type === 'code') {
        const { language, children, ...rest } = props ?? {};
        if (language) {
            return {
                type: 'pre',
                props: {
                    children: {
                        type: 'code',
                        props: {
                            ...rest,
                            class: `language-${language}`,
                            children,
                        },
                    },
                },
                key,
            };
        }
        return {
            type: 'code',
            props: {
                ...rest,
                children,
            },
            key,
        };
    }

    // 6. Transform <pre language="..."> into <pre><code class="language-...">
    if (type === 'pre') {
        const { language, children, ...rest } = props ?? {};
        if (language) {
            return {
                type: 'pre',
                props: {
                    ...rest,
                    children: {
                        type: 'code',
                        props: {
                            class: `language-${language}`,
                            children,
                        },
                    },
                },
                key,
            };
        }
        return {
            type: 'pre',
            props: {
                ...rest,
                children,
            },
            key,
        };
    }

    return {
        type,
        props,
        key,
    };
};

/**
 * Creates static children JSX elements (aliased to `jsx`).
 */
export const jsxs = (type: any, props: any, key?: any): TelegramNativeElement => {
    return jsx(type, props, key);
};

/**
 * Development JSX element factory (aliased to `jsx`).
 */
export const jsxDEV = (type: any, props: any, key?: any): TelegramNativeElement => {
    return jsx(type, props, key);
};

/**
 * Fragment wrapper returning its inner children directly.
 */
export const Fragment = (props: { children?: NativeChildren; key?: any }): any => {
    return props?.children;
};

/**
 * Classic JSX factory function for `/** @jsx h * /` pragmas and direct calls.
 */
export const h = (type: any, props: any, ...children: any[]): TelegramNativeElement => {
    const finalProps: Record<string, any> = { ...props };
    if (children.length === 1) {
        finalProps.children = children[0];
    } else if (children.length > 1) {
        finalProps.children = children;
    }
    return jsx(type, finalProps);
};
