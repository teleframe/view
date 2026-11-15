/**
 * @fileoverview Strict Telegram Native HTML JSX Runtime
 * @module @teleframe/view/native/jsx-runtime
 */

import { TelegramSecurityError } from './sanitizer';
import type { NativeChildren, TelegramNativeElement } from './tags/base';
import { normalizeTimeFormat } from './tags/time';

export * from './jsx-types';
export * from './tags';

const wrapLanguage = (
    language: string,
    children: any,
    rest: any,
    key?: any,
): TelegramNativeElement => ({
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
});

/**
 * Creates and transforms a Telegram virtual native JSX element node.
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
            throw new TelegramSecurityError(
                `[Telegram Markup] Invalid user ID: "${id}". Telegram user ID must be a positive integer.`,
            );
        }
        return {
            type: 'a',
            props: { ...rest, href: `tg://user?id=${numId}`, children },
            key,
        };
    }

    // 2. Transform virtual <mono>...</mono> into Telegram inline <code>...</code>
    if (type === 'mono') {
        return { type: 'code', props, key };
    }

    // 3. Normalize format aliases on <tg-time unix="..." format="...">
    if (type === 'tg-time' && props?.format) {
        const { format, ...rest } = props;
        return {
            type: 'tg-time',
            props: { ...rest, format: normalizeTimeFormat(format) },
            key,
        };
    }

    // 4. Transform virtual <codeblock language="..."> into Telegram code block
    if (type === 'codeblock' || type === 'code' || type === 'pre') {
        const { language, children, ...rest } = props ?? {};
        if (language) {
            return wrapLanguage(language, children, rest, key);
        }
        return {
            type: type === 'codeblock' ? 'pre' : type,
            props: { ...rest, children },
            key,
        };
    }

    return { type, props, key };
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
