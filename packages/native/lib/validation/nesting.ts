/**
 * @fileoverview Telegram Bot API tag nesting validation algorithm
 * @module @teleframe/view/native/validation/nesting
 */

import {
    checkBlockquoteAndFormatting,
    checkCodePreNesting,
    type NestingContext,
    resolveTagIdentifier,
    TelegramNestingError,
} from './rules';

export { type NestingContext, resolveTagIdentifier, TelegramNestingError } from './rules';

const checkLinkAndAtomic = (
    resolvedTag: string,
    isLink: boolean,
    isTime: boolean,
    isCode: boolean,
    isPre: boolean,
    isBlockquote: boolean,
    isEmoji: boolean,
    pathStr: string,
    context: NestingContext,
): void => {
    if (context.insideLink) {
        if (isLink || isTime || isCode || isPre || isBlockquote || isEmoji) {
            const reason = isLink
                ? 'Links cannot be nested.'
                : isTime
                  ? 'Formatted date/time cannot be nested inside links.'
                  : isEmoji
                    ? 'Custom emoji cannot be nested inside links.'
                    : isBlockquote
                      ? 'Block quotations cannot be nested inside links.'
                      : 'Preformatted code cannot be nested inside links.';
            throw new TelegramNestingError(
                `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside a link at path "${pathStr}". ${reason}`,
                'a',
                resolvedTag,
                pathStr,
            );
        }
    }

    if (context.insideEmoji) {
        throw new TelegramNestingError(
            `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <tg-emoji> at path "${pathStr}". Custom emoji cannot contain any other formatting tags.`,
            'tg-emoji',
            resolvedTag,
            pathStr,
        );
    }

    if (context.insideTime) {
        throw new TelegramNestingError(
            `Telegram Bot API violation: Cannot nest <${resolvedTag}> inside <tg-time> at path "${pathStr}". Formatted date/time cannot contain any other formatting tags.`,
            'tg-time',
            resolvedTag,
            pathStr,
        );
    }
};

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
        for (const child of node) validateNesting(child, context);
        return;
    }

    if (typeof node === 'object' && 'type' in node) {
        const element = node as { type: unknown; props?: Record<string, unknown> };
        const rawTag = resolveTagIdentifier(element.type);

        const isSpoilerSpan =
            rawTag === 'span' &&
            Boolean(
                element.props &&
                (element.props.class === 'tg-spoiler' || element.props.className === 'tg-spoiler'),
            );
        const resolvedTag = isSpoilerSpan ? 'tg-spoiler' : rawTag;

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

        checkCodePreNesting(resolvedTag, pathStr, context);
        checkBlockquoteAndFormatting(resolvedTag, isBlockquote, isCode, isPre, pathStr, context);
        checkLinkAndAtomic(
            resolvedTag,
            isLink,
            isTime,
            isCode,
            isPre,
            isBlockquote,
            isEmoji,
            pathStr,
            context,
        );

        const nextContext: NestingContext = {
            path: currentPath,
            insideBlockquote: context.insideBlockquote || isBlockquote,
            insideCode: context.insideCode || isCode,
            insidePre: context.insidePre || isPre,
            insideLink: context.insideLink || isLink,
            insideEmoji: context.insideEmoji || isEmoji,
            insideTime: context.insideTime || isTime,
            insideFormatting: context.insideFormatting || isFormatting,
            formattingParentTag: isFormatting ? resolvedTag : context.formattingParentTag,
        };

        if (element.props?.children !== undefined) {
            validateNesting(element.props.children, nextContext);
        }
    }
};
