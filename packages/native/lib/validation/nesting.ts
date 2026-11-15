/**
 * @fileoverview Telegram Bot API tag nesting validation rules and matrix
 * @module @telegram-markup/native/validation/nesting
 */

export class TelegramNestingError extends Error {
    public readonly parentTag: string;
    public readonly childTag: string;
    public readonly path: string;

    constructor(message: string, parentTag: string, childTag: string, path: string) {
        super(message);
        this.name = 'TelegramNestingError';
        this.parentTag = parentTag;
        this.childTag = childTag;
        this.path = path;
    }
}

interface NestingContext {
    insideBlockquote?: boolean;
    insideCode?: boolean;
    insidePre?: boolean;
    insideLink?: boolean;
    insideEmoji?: boolean;
    insideTime?: boolean;
    insideFormatting?: boolean;
    formattingParentTag?: string;
    path: string[];
}

/**
 * Normalizes element tag name or component name to a canonical identifier.
 */
export const resolveTagIdentifier = (type: unknown): string => {
    let raw = 'unknown';
    if (typeof type === 'string') raw = type.toLowerCase();
    else if (typeof type === 'function') {
        raw = (type as { name?: string }).name?.toLowerCase() ?? 'component';
    }

    const COMPONENT_TAG_MAP: Record<string, string> = {
        bold: 'b',
        strong: 'b',
        b: 'b',

        italic: 'i',
        em: 'i',
        i: 'i',

        underline: 'u',
        ins: 'u',
        u: 'u',

        strike: 's',
        strikethrough: 's',
        del: 's',
        s: 's',

        spoiler: 'tg-spoiler',
        'tg-spoiler': 'tg-spoiler',

        link: 'a',
        a: 'a',
        user: 'user',

        code: 'code',
        mono: 'code',

        codeblock: 'pre',
        pre: 'pre',

        blockquote: 'blockquote',

        emoji: 'tg-emoji',
        'tg-emoji': 'tg-emoji',

        time: 'tg-time',
        'tg-time': 'tg-time',

        br: 'br',
        break: 'br',
        newline: 'br',

        divider: 'hr',
        hr: 'hr',

        paragraph: 'p',
        p: 'p',

        li: 'li',
        ul: 'ul',
        ol: 'ol',
    };

    return COMPONENT_TAG_MAP[raw] ?? raw;
};

/**
 * Validates the Telegram JSX tree against Telegram Bot API formatting rules.
 *
 * Rules enforced:
 * - Code (inline monospace) cannot contain any other formatting tags or elements.
 * - Pre (code block) can only contain text or an optional <code> tag with language.
 * - Blockquote cannot be nested inside another Blockquote, inside links, or inside formatting tags.
 * - Formatting tags (<b>, <i>, <u>, <s>, <tg-spoiler>) cannot contain preformatted code (<pre>, <code>) or block quotations (<blockquote>).
 * - Links (<a>, <Link>, <User>) cannot be nested inside another link and cannot contain date/time, code/pre, blockquote, or custom emoji.
 * - Custom Emoji (<tg-emoji>, <Emoji>) cannot contain nested formatting tags.
 * - Formatted Time (<tg-time>, <Time>) cannot contain nested formatting tags.
 */
export const validateNesting = (node: unknown, context: NestingContext = { path: [] }): void => {
    if (
        node === null ||
        node === undefined ||
        typeof node === 'boolean' ||
        typeof node === 'number' ||
        typeof node === 'string'
    ) {
        return;
    }

    if (Array.isArray(node)) {
        for (const child of node) {
            validateNesting(child, context);
        }
        return;
    }

    if (typeof node === 'object' && 'type' in node) {
        const element = node as { type: unknown; props?: Record<string, unknown> };
        const rawTag = resolveTagIdentifier(element.type);

        // Normalize <span class="tg-spoiler"> to canonical 'tg-spoiler'
        const isSpoilerSpan =
            rawTag === 'span' &&
            Boolean(
                element.props &&
                (element.props.class === 'tg-spoiler' || element.props.className === 'tg-spoiler'),
            );
        const resolvedTag = isSpoilerSpan ? 'tg-spoiler' : rawTag;

        // Virtual aliases normalization
        const isBlockquote = resolvedTag === 'blockquote';
        const isCode = resolvedTag === 'code';
        const isPre = resolvedTag === 'pre';
        const isLink = resolvedTag === 'a' || resolvedTag === 'user';
        const isEmoji = resolvedTag === 'tg-emoji';
        const isTime = resolvedTag === 'tg-time';
        const isFormatting =
            resolvedTag === 'b' ||
            resolvedTag === 'i' ||
            resolvedTag === 'u' ||
            resolvedTag === 's' ||
            resolvedTag === 'tg-spoiler';

        const currentPath = [...context.path, resolvedTag];
        const pathStr = currentPath.join(' > ');

        // 1. Rule: Code cannot contain formatting elements
        if (context.insideCode) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <code> at path "${pathStr}". Preformatted code cannot contain any other formatting.`,
                'code',
                resolvedTag,
                pathStr,
            );
        }

        // 2. Rule: Pre can only contain text or <code class="language-...">
        if (context.insidePre) {
            if (resolvedTag !== 'code') {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <pre> at path "${pathStr}". Preformatted blocks can only contain plain text or a <code> element specifying programming language.`,
                    'pre',
                    resolvedTag,
                    pathStr,
                );
            }
        }

        // 3. Rule: Blockquote cannot be nested inside another Blockquote
        if (isBlockquote && context.insideBlockquote) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <blockquote /> inside another <blockquote> at path "${pathStr}". Block quotations cannot be nested.`,
                'blockquote',
                resolvedTag,
                pathStr,
            );
        }

        // 4. Rule: Formatting tags (b, i, u, s, spoiler) cannot contain code, pre, or blockquote
        // Per Telegram Bot API: "bold, italic, underline, strikethrough, and spoiler entities can contain and can be part of any other entities, except pre and code."
        // And blockquotes cannot be nested inside formatting tags.
        if (context.insideFormatting) {
            const parentTag = context.formattingParentTag ?? 'b';
            if (isCode) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside formatting <${parentTag}> at path "${pathStr}". Preformatted code cannot be nested inside formatting tags.`,
                    parentTag,
                    resolvedTag,
                    pathStr,
                );
            }
            if (isPre) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside formatting <${parentTag}> at path "${pathStr}". Preformatted code blocks cannot be nested inside formatting tags.`,
                    parentTag,
                    resolvedTag,
                    pathStr,
                );
            }
            if (isBlockquote) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside formatting <${parentTag}> at path "${pathStr}". Block quotations cannot be nested inside formatting tags.`,
                    parentTag,
                    resolvedTag,
                    pathStr,
                );
            }
        }

        // 5. Rule: Inside links (<a>, <Link>, <User>), only plain text and nested formatting elements (b, i, u, s, spoiler) are permitted.
        // Nested links, date/time, code/pre, blockquote, and custom emoji are forbidden by Telegram Bot API.
        if (context.insideLink) {
            if (isLink) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside a link at path "${pathStr}". Links cannot be nested.`,
                    'a',
                    resolvedTag,
                    pathStr,
                );
            }
            if (isTime) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside a link at path "${pathStr}". Formatted date/time cannot be nested inside links.`,
                    'a',
                    resolvedTag,
                    pathStr,
                );
            }
            if (isCode || isPre) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside a link at path "${pathStr}". Preformatted code cannot be nested inside links.`,
                    'a',
                    resolvedTag,
                    pathStr,
                );
            }
            if (isBlockquote) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside a link at path "${pathStr}". Block quotations cannot be nested inside links.`,
                    'a',
                    resolvedTag,
                    pathStr,
                );
            }
            if (isEmoji) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside a link at path "${pathStr}". Custom emoji cannot be nested inside links.`,
                    'a',
                    resolvedTag,
                    pathStr,
                );
            }
        }

        // 6. Rule: Custom Emoji cannot contain nested tags
        if (context.insideEmoji) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <tg-emoji> at path "${pathStr}". Custom emoji elements cannot contain formatting tags.`,
                'tg-emoji',
                resolvedTag,
                pathStr,
            );
        }

        // 7. Rule: Formatted Time cannot contain nested formatting tags
        if (context.insideTime) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <tg-time> at path "${pathStr}". Time fallback elements cannot contain formatting tags.`,
                'tg-time',
                resolvedTag,
                pathStr,
            );
        }

        // Execute function component if applicable to check expanded tree
        if (typeof element.type === 'function') {
            const evaluated = (element.type as (props: unknown) => unknown)(element.props ?? {});
            validateNesting(evaluated, context);
            return;
        }

        // Traverse children with updated context
        const nextContext: NestingContext = {
            insideBlockquote: context.insideBlockquote || isBlockquote,
            insideCode: context.insideCode || isCode,
            insidePre: context.insidePre || isPre,
            insideLink: context.insideLink || isLink,
            insideEmoji: context.insideEmoji || isEmoji,
            insideTime: context.insideTime || isTime,
            insideFormatting: context.insideFormatting || isFormatting,
            formattingParentTag: isFormatting ? resolvedTag : context.formattingParentTag,
            path: currentPath,
        };

        if (element.props && 'children' in element.props) {
            validateNesting(element.props.children, nextContext);
        }
    }
};
