/**
 * @fileoverview Element tree expansion and one-time component resolution
 * @module @telegram-markup/native/tree
 */

import { RAW_HTML_TYPE } from './components/raw-html/raw-html';

/**
 * Recursively resolves function components and render callbacks across the JSX tree exactly once.
 *
 * Prevents double-execution of function components and children callbacks between
 * AST validation (`validateNesting`) and serializers (`renderToString` / `compileToEntities`),
 * ensuring that side effects, dynamic evaluations, and conditional branches remain 100% consistent.
 *
 * @param node - Raw Telegram JSX element, component, array, or primitive node
 * @returns Fully expanded element tree with only intrinsic tags, RawHtml, and primitive values
 */
export const resolveTree = (node: unknown): unknown => {
    if (
        node === null ||
        node === undefined ||
        typeof node === 'boolean' ||
        typeof node === 'string' ||
        typeof node === 'number'
    ) {
        return node;
    }

    if (Array.isArray(node)) {
        return node.map(resolveTree);
    }

    if (typeof node === 'object' && 'type' in (node as Record<string, unknown>)) {
        const element = node as {
            type: unknown;
            props?: Record<string, unknown>;
            key?: unknown;
        };

        // 1. Function component: execute once and recursively resolve its returned tree
        if (typeof element.type === 'function') {
            const evaluated = (element.type as (props: unknown) => unknown)(element.props ?? {});
            return resolveTree(evaluated);
        }

        // 2. Raw HTML escape hatch: preserve as-is without modifying its props
        if (element.type === RAW_HTML_TYPE) {
            return element;
        }

        // 3. Intrinsic element: recursively resolve children if present
        if (element.props && 'children' in element.props) {
            return {
                ...element,
                props: {
                    ...element.props,
                    children: resolveTree(element.props.children),
                },
            };
        }

        return element;
    }

    return node;
};
