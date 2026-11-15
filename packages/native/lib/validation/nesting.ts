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
        italic: 'i',
        underline: 'u',
        strike: 's',
        spoiler: 'tg-spoiler',
        link: 'a',
        user: 'user',
        code: 'code',
        mono: 'code',
        codeblock: 'pre',
        pre: 'pre',
        blockquote: 'blockquote',
        emoji: 'tg-emoji',
        time: 'tg-time',
        br: 'br',
        break: 'br',
        newline: 'br',
        divider: 'hr',
        hr: 'hr',
        paragraph: 'p',
        p: 'p',
        li: 'li',
    };

    return COMPONENT_TAG_MAP[raw] ?? raw;
};

/**
 * Validates the Telegram JSX tree against Telegram Bot API formatting rules.
 *
 * Rules enforced:
 * - Blockquote cannot be nested inside another Blockquote or inside links.
 * - Code (inline monospace) cannot contain any other formatting tags or elements.
 * - Pre (code block) can only contain text or an optional <code> tag with language.
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

        // Virtual aliases normalization
        const isBlockquote = rawTag === 'blockquote';
        const isCode = rawTag === 'code' || rawTag === 'mono';
        const isPre = rawTag === 'pre' || rawTag === 'codeblock';
        const isLink = rawTag === 'a' || rawTag === 'link' || rawTag === 'user';
        const isEmoji = rawTag === 'tg-emoji' || rawTag === 'emoji';
        const isTime = rawTag === 'tg-time' || rawTag === 'time';

        const currentPath = [...context.path, rawTag];
        const pathStr = currentPath.join(' > ');

        // 1. Rule: Code cannot contain formatting elements
        if (context.insideCode) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${rawTag}> inside <code> at path "${pathStr}". Preformatted code cannot contain any other formatting.`,
                'code',
                rawTag,
                pathStr,
            );
        }

        // 2. Rule: Pre can only contain text or <code class="language-...">
        if (context.insidePre) {
            if (rawTag !== 'code') {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${rawTag}> inside <pre> at path "${pathStr}". Preformatted blocks can only contain plain text or a <code> element specifying programming language.`,
                    'pre',
                    rawTag,
                    pathStr,
                );
            }
        }

        // 3. Rule: Blockquote cannot be nested inside another Blockquote
        if (isBlockquote && context.insideBlockquote) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <blockquote /> inside another <blockquote> at path "${pathStr}". Block quotations cannot be nested.`,
                'blockquote',
                rawTag,
                pathStr,
            );
        }

        // 4. Rule: Inside links (<a>, <Link>, <User>), only plain text and nested formatting elements (b, i, u, s, spoiler) are permitted.
        // Nested links, date/time, code/pre, blockquote, and custom emoji are forbidden by Telegram Bot API.
        if (context.insideLink) {
            if (isLink) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${rawTag}> inside a link at path "${pathStr}". Links cannot be nested.`,
                    'a',
                    rawTag,
                    pathStr,
                );
            }
            if (isTime) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${rawTag}> inside a link at path "${pathStr}". Formatted date/time cannot be nested inside links.`,
                    'a',
                    rawTag,
                    pathStr,
                );
            }
            if (isCode || isPre) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${rawTag}> inside a link at path "${pathStr}". Preformatted code cannot be nested inside links.`,
                    'a',
                    rawTag,
                    pathStr,
                );
            }
            if (isBlockquote) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${rawTag}> inside a link at path "${pathStr}". Block quotations cannot be nested inside links.`,
                    'a',
                    rawTag,
                    pathStr,
                );
            }
            if (isEmoji) {
                throw new TelegramNestingError(
                    `Telegram Bot API violation: Cannot nest <${rawTag}> inside a link at path "${pathStr}". Custom emoji cannot be nested inside links.`,
                    'a',
                    rawTag,
                    pathStr,
                );
            }
        }

        // 5. Rule: Custom Emoji cannot contain nested tags
        if (context.insideEmoji) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${rawTag}> inside <tg-emoji> at path "${pathStr}". Custom emoji elements cannot contain formatting tags.`,
                'tg-emoji',
                rawTag,
                pathStr,
            );
        }

        // 6. Rule: Formatted Time cannot contain nested formatting tags
        if (context.insideTime) {
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${rawTag}> inside <tg-time> at path "${pathStr}". Time fallback elements cannot contain formatting tags.`,
                'tg-time',
                rawTag,
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
            path: currentPath,
        };

        if (element.props && 'children' in element.props) {
            validateNesting(element.props.children, nextContext);
        }
    }
};
