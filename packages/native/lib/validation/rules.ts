/**
 * @fileoverview Telegram Bot API nesting error class, context, and validation rules
 * @module @teleframe/view/native/validation/rules
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

export interface NestingContext {
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

/**
 * Normalizes element tag name or component name to a canonical identifier.
 */
export const resolveTagIdentifier = (type: unknown): string => {
    let raw = 'unknown';
    if (typeof type === 'string') raw = type.toLowerCase();
    else if (typeof type === 'function') {
        raw = (type as { name?: string }).name?.toLowerCase() ?? 'component';
    }
    return COMPONENT_TAG_MAP[raw] ?? raw;
};

export const checkCodePreNesting = (
    resolvedTag: string,
    pathStr: string,
    context: NestingContext,
): void => {
    if (context.insideCode) {
        throw new TelegramNestingError(
            `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <code> at path "${pathStr}". Preformatted code cannot contain any other formatting.`,
            'code',
            resolvedTag,
            pathStr,
        );
    }
    if (context.insidePre && resolvedTag !== 'code') {
        throw new TelegramNestingError(
            `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <pre> at path "${pathStr}". Preformatted blocks can only contain plain text or a <code> element specifying programming language.`,
            'pre',
            resolvedTag,
            pathStr,
        );
    }
};

export const checkBlockquoteAndFormatting = (
    resolvedTag: string,
    isBlockquote: boolean,
    isCode: boolean,
    isPre: boolean,
    pathStr: string,
    context: NestingContext,
): void => {
    if (isBlockquote && context.insideBlockquote) {
        throw new TelegramNestingError(
            `Telegram Bot API violation: Cannot nest <blockquote /> inside another <blockquote> at path "${pathStr}". Block quotations cannot be nested.`,
            'blockquote',
            resolvedTag,
            pathStr,
        );
    }
    if (context.insideFormatting) {
        const parentTag = context.formattingParentTag ?? 'b';
        if (isCode || isPre || isBlockquote) {
            const desc = isCode
                ? 'Preformatted code'
                : isPre
                  ? 'Preformatted code blocks'
                  : 'Block quotations';
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside formatting <${parentTag}> at path "${pathStr}". ${desc} cannot be nested inside formatting tags.`,
                parentTag,
                resolvedTag,
                pathStr,
            );
        }
    }
};
