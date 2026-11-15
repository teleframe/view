/**
 * @fileoverview Single-pass compiler for Telegram Bot API MessageEntity output
 * @module @telegram-markup/native/entities
 */

import { RAW_HTML_TYPE } from './components/raw-html';
import { isValidUrl } from './sanitizer';
import type { NativeChildren } from './tags/base';
import { normalizeTimeFormat, normalizeTimestamp } from './tags/time';
import { resolveTree } from './tree';
import { TelegramNestingError, validateNesting } from './validation/nesting';

export interface BaseMessageEntity {
    type: string;
    offset: number;
    length: number;
}

export interface CommonMessageEntity extends BaseMessageEntity {
    type:
        | 'mention'
        | 'hashtag'
        | 'cashtag'
        | 'bot_command'
        | 'url'
        | 'email'
        | 'phone_number'
        | 'bold'
        | 'italic'
        | 'underline'
        | 'strikethrough'
        | 'spoiler'
        | 'blockquote'
        | 'expandable_blockquote'
        | 'code';
}

export interface PreMessageEntity extends BaseMessageEntity {
    type: 'pre';
    language?: string;
}

export interface TextLinkMessageEntity extends BaseMessageEntity {
    type: 'text_link';
    url: string;
}

export interface TelegramUser {
    id: number;
    first_name?: string;
    is_bot?: boolean;
    last_name?: string;
    username?: string;
    [key: string]: any;
}

export interface TextMentionMessageEntity extends BaseMessageEntity {
    type: 'text_mention';
    user: any;
}

export interface CustomEmojiMessageEntity extends BaseMessageEntity {
    type: 'custom_emoji';
    custom_emoji_id: string;
}

export interface DateTimeMessageEntity extends BaseMessageEntity {
    type: 'date_time';
    unix_time: number;
    date_time_format: any;
}

export type MessageEntity =
    | CommonMessageEntity
    | PreMessageEntity
    | TextLinkMessageEntity
    | TextMentionMessageEntity
    | CustomEmojiMessageEntity
    | DateTimeMessageEntity;

export interface RenderResult {
    text: string;
    entities: MessageEntity[];
}

const FORMATTING_TYPES = new Set(['bold', 'italic', 'underline', 'strikethrough', 'spoiler']);
const CODE_TYPES = new Set(['code', 'pre']);
const LINK_TYPES = new Set(['text_link', 'text_mention']);
const BLOCKQUOTE_TYPES = new Set(['blockquote', 'expandable_blockquote']);
const ATOMIC_TYPES = new Set(['custom_emoji', 'date_time']);

/**
 * Validates whether childType can be legally nested inside parentType according to
 * the Telegram Bot API message entity formatting rules.
 */
export const isEntityNestingAllowed = (parentType: string, childType: string): boolean => {
    // 1. Leaf / atomic entities cannot contain any nested entities
    if (ATOMIC_TYPES.has(parentType)) {
        return false;
    }

    // 2. Preformatted code entities cannot contain any nested entities in MessageEntity output
    if (CODE_TYPES.has(parentType)) {
        return false;
    }

    // 3. Links and mentions can only contain inline formatting entities
    if (LINK_TYPES.has(parentType)) {
        return FORMATTING_TYPES.has(childType);
    }

    // 4. Blockquotes can contain formatting, code, links, and atomic entities, but cannot contain nested blockquotes
    if (BLOCKQUOTE_TYPES.has(parentType)) {
        return !BLOCKQUOTE_TYPES.has(childType);
    }

    // 5. Formatting entities can contain other formatting, links, and atomic entities, but cannot contain code, pre, or blockquotes
    if (FORMATTING_TYPES.has(parentType)) {
        if (CODE_TYPES.has(childType) || BLOCKQUOTE_TYPES.has(childType)) {
            return false;
        }
        return true;
    }

    return true;
};

/**
 * Validates that all entities are either strictly nested or disjoint,
 * and never overlap/intersect across boundaries or violate type compatibility.
 */
export const validateEntitiesOverlap = (entities: MessageEntity[]): void => {
    // Compiler output is already ordered. Keep the common path linear, while
    // accepting unsorted input from direct public callers.
    let ordered = entities;
    for (let i = 1; i < entities.length; i++) {
        const previous = entities[i - 1];
        const current = entities[i];
        if (
            current.offset < previous.offset ||
            (current.offset === previous.offset && current.length > previous.length)
        ) {
            ordered = entities
                .map((entity, index) => ({ entity, index }))
                .sort(
                    (a, b) =>
                        a.entity.offset - b.entity.offset ||
                        b.entity.length - a.entity.length ||
                        a.index - b.index,
                )
                .map(({ entity }) => entity);
            break;
        }
    }

    // Maintain an active ancestor stack representing the currently open entity hierarchy.
    // In valid Telegram formatting, entities are strictly nested or disjoint (parentheses tree).
    // An active ancestor stack provides strictly linear O(N) verification instead of quadratic O(N^2).
    const stack: { entity: MessageEntity; end: number }[] = [];

    for (let i = 0; i < ordered.length; i++) {
        const current = ordered[i];
        const currentEnd = current.offset + current.length;

        // Pop all ancestors that closed at or before the start of the current entity.
        while (stack.length > 0 && stack[stack.length - 1].end <= current.offset) {
            stack.pop();
        }

        if (stack.length > 0) {
            const top = stack[stack.length - 1];

            // 1. Boundary check: current entity starts inside top (current.offset < top.end).
            // To be strictly nested, it MUST also end within top (currentEnd <= top.end).
            // If currentEnd > top.end, they intersect partially, violating Telegram formatting rules.
            if (currentEnd > top.end) {
                throw new TelegramNestingError(
                    `Telegram Bot API boundary violation: Entities of type "${top.entity.type}" [${top.entity.offset}..${top.end}] and "${current.type}" [${current.offset}..${currentEnd}] intersect invalidly. In Telegram Bot API, entities must be strictly nested or disjoint.`,
                    top.entity.type,
                    current.type,
                    `${top.entity.type} & ${current.type}`,
                );
            }

            // 2. Compatibility check: verify compatibility against all enclosing active ancestors.
            for (let s = stack.length - 1; s >= 0; s--) {
                const ancestor = stack[s];
                if (!isEntityNestingAllowed(ancestor.entity.type, current.type)) {
                    throw new TelegramNestingError(
                        `Telegram Bot API nesting violation: Entity of type "${current.type}" [${current.offset}..${currentEnd}] cannot be nested inside entity of type "${ancestor.entity.type}" [${ancestor.entity.offset}..${ancestor.end}]. Per Telegram Bot API formatting rules, this combination is incompatible.`,
                        ancestor.entity.type,
                        current.type,
                        `${ancestor.entity.type} > ${current.type}`,
                    );
                }
            }
        }

        stack.push({ entity: current, end: currentEnd });
    }
};

/**
 * Compiles a Telegram JSX tree into text and MessageEntity array in a single pass.
 */
export const compileToEntities = (tree: NativeChildren): RenderResult => {
    // 1. Recursively resolve components and callbacks exactly once
    const resolved = resolveTree(tree);

    // 2. Validate tree nesting before compilation
    validateNesting(resolved);

    let text = '';
    const rawEntities: Array<{ entity: MessageEntity; depth: number }> = [];

    const traverse = (node: unknown, depth: number = 0): void => {
        if (node === null || node === undefined || typeof node === 'boolean') {
            return;
        }

        if (typeof node === 'string') {
            text += node;
            return;
        }

        if (typeof node === 'number') {
            text += String(node);
            return;
        }

        if (Array.isArray(node)) {
            for (const child of node) {
                traverse(child, depth);
            }
            return;
        }

        if (typeof node === 'object' && 'type' in (node as Record<string, unknown>)) {
            const element = node as {
                type: unknown;
                props?: Record<string, unknown>;
            };

            // Function component
            if (typeof element.type === 'function') {
                const evaluated = (element.type as (p: unknown) => unknown)(element.props ?? {});
                traverse(evaluated, depth);
                return;
            }

            // Raw HTML escape hatch
            if (element.type === RAW_HTML_TYPE) {
                const html = String(element.props?.html ?? '');
                // Strip HTML tags for entity plain text representation
                text += html.replace(/<[^>]*>/g, '');
                return;
            }

            if (typeof element.type === 'string') {
                const tag = element.type.toLowerCase();
                const props = element.props ?? {};

                // Virtual line break
                if (tag === 'br') {
                    const count = Math.max(1, (props.count ?? props.lines ?? 1) as number);
                    text += '\n'.repeat(count);
                    return;
                }

                // Virtual horizontal rule
                if (tag === 'hr') {
                    const char = String(props.char ?? '—');
                    const length = Math.max(1, (props.length ?? 20) as number);
                    const before = '\n'.repeat((props.before ?? 1) as number);
                    const after = '\n'.repeat((props.after ?? 1) as number);
                    text += `${before}${char.repeat(length)}${after}`;
                    return;
                }

                // Virtual list item
                if (tag === 'li') {
                    const marker = String(props.marker ?? '• ');
                    const indent = Math.max(0, (props.indent ?? 0) as number);
                    const indentStr = '  '.repeat(indent);
                    text += `${indentStr}${marker}`;
                    traverse(props.children, depth);
                    text += '\n';
                    return;
                }

                // Virtual paragraph
                if (tag === 'p') {
                    const beforeCount = Math.max(0, (props.before ?? 0) as number);
                    const afterCount = Math.max(
                        0,
                        (props.after ?? props.spacing ?? props.lines ?? props.count ?? 2) as number,
                    );
                    text += '\n'.repeat(beforeCount);
                    traverse(props.children, depth);
                    text += '\n'.repeat(afterCount);
                    return;
                }

                // Handle pre/codeblock explicitly to avoid duplicate traversal
                if (tag === 'pre' || tag === 'codeblock') {
                    let language = props.language as string | undefined;
                    let preChildren = props.children;

                    // Check if children is a virtual <code> wrapping the text
                    if (
                        preChildren &&
                        typeof preChildren === 'object' &&
                        'type' in (preChildren as Record<string, unknown>)
                    ) {
                        const innerEl = preChildren as {
                            type: unknown;
                            props?: Record<string, unknown>;
                        };
                        if (innerEl.type === 'code' || innerEl.type === 'mono') {
                            const codeProps = innerEl.props ?? {};
                            const cls = (codeProps.class ?? codeProps.className) as
                                string | undefined;
                            if (typeof cls === 'string' && cls.startsWith('language-')) {
                                language = cls.slice('language-'.length);
                            } else if (typeof codeProps.language === 'string') {
                                language = codeProps.language;
                            }
                            preChildren = codeProps.children;
                        }
                    }

                    const preStartOffset = text.length;
                    traverse(preChildren, depth + 1);
                    const preEndOffset = text.length;
                    const preLength = preEndOffset - preStartOffset;

                    if (preLength > 0) {
                        const preEntity: PreMessageEntity = {
                            type: 'pre',
                            offset: preStartOffset,
                            length: preLength,
                        };
                        if (typeof language === 'string' && language.length > 0) {
                            preEntity.language = language;
                        }
                        rawEntities.push({ entity: preEntity, depth });
                    }
                    return;
                }

                const startOffset = text.length;

                // Traverse inner children with depth + 1
                traverse(props.children, depth + 1);

                const endOffset = text.length;
                const length = endOffset - startOffset;

                // Only emit entity if non-empty text content was produced
                if (length <= 0) {
                    return;
                }

                // Build entity matching Telegram Bot API types
                switch (tag) {
                    case 'b':
                    case 'strong':
                        rawEntities.push({
                            entity: { type: 'bold', offset: startOffset, length },
                            depth,
                        });
                        break;

                    case 'i':
                    case 'em':
                        rawEntities.push({
                            entity: { type: 'italic', offset: startOffset, length },
                            depth,
                        });
                        break;

                    case 'u':
                    case 'ins':
                        rawEntities.push({
                            entity: { type: 'underline', offset: startOffset, length },
                            depth,
                        });
                        break;

                    case 's':
                    case 'strike':
                    case 'del':
                        rawEntities.push({
                            entity: { type: 'strikethrough', offset: startOffset, length },
                            depth,
                        });
                        break;

                    case 'tg-spoiler':
                        rawEntities.push({
                            entity: { type: 'spoiler', offset: startOffset, length },
                            depth,
                        });
                        break;

                    case 'span': {
                        const cls = props.class ?? props.className;
                        if (cls === 'tg-spoiler') {
                            rawEntities.push({
                                entity: { type: 'spoiler', offset: startOffset, length },
                                depth,
                            });
                        }
                        break;
                    }

                    case 'blockquote': {
                        const isExpandable = props.expandable === true;
                        rawEntities.push({
                            entity: {
                                type: isExpandable ? 'expandable_blockquote' : 'blockquote',
                                offset: startOffset,
                                length,
                            },
                            depth,
                        });
                        break;
                    }

                    case 'code':
                    case 'mono':
                        rawEntities.push({
                            entity: { type: 'code', offset: startOffset, length },
                            depth,
                        });
                        break;

                    case 'a': {
                        const href = typeof props.href === 'string' ? props.href.trim() : '';
                        if (!href) {
                            throw new Error(
                                '[Telegram Markup] Invalid attribute: <a> tag requires a non-empty "href" attribute.',
                            );
                        }
                        if (!isValidUrl(href)) {
                            throw new Error(
                                `[Telegram Markup] Security Error: Invalid or prohibited URL in <a href="${href}">. Only http, https, tg, mailto, and tel schemes are allowed.`,
                            );
                        }

                        if (/^tg:\/\/user\?id=/i.test(href)) {
                            const userIdStr = href.slice('tg://user?id='.length);
                            const userId = Number(userIdStr);
                            if (!Number.isSafeInteger(userId) || userId <= 0) {
                                throw new Error(
                                    `[Telegram Markup] Invalid user ID in mention link: "${href}". User ID must be a positive integer.`,
                                );
                            }
                            rawEntities.push({
                                entity: {
                                    type: 'text_mention',
                                    offset: startOffset,
                                    length,
                                    user: { id: userId },
                                },
                                depth,
                            });
                        } else {
                            rawEntities.push({
                                entity: {
                                    type: 'text_link',
                                    offset: startOffset,
                                    length,
                                    url: href,
                                },
                                depth,
                            });
                        }
                        break;
                    }

                    case 'user': {
                        const rawId = props.id;
                        if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
                            throw new Error('[Telegram Markup] <user> requires a valid "id" prop.');
                        }
                        const userId = Number(rawId);
                        if (!Number.isSafeInteger(userId) || userId <= 0) {
                            throw new Error(
                                `[Telegram Markup] Invalid user ID: "${rawId}". Telegram user ID must be a positive integer.`,
                            );
                        }
                        rawEntities.push({
                            entity: {
                                type: 'text_mention',
                                offset: startOffset,
                                length,
                                user: { id: userId },
                            },
                            depth,
                        });
                        break;
                    }

                    case 'tg-emoji': {
                        const rawId = props['emoji-id'] ?? props.emojiId ?? props.id;
                        if (rawId === undefined || rawId === null || String(rawId).trim() === '') {
                            throw new Error(
                                '[Telegram Markup] Invalid attribute: <tg-emoji> requires a non-empty "emoji-id" attribute.',
                            );
                        }
                        const emojiId = String(rawId).trim();
                        if (!/^\d+$/.test(emojiId)) {
                            throw new Error(
                                `[Telegram Markup] Invalid emoji-id: "${rawId}". Telegram custom emoji ID must be a numeric string of digits.`,
                            );
                        }
                        rawEntities.push({
                            entity: {
                                type: 'custom_emoji',
                                offset: startOffset,
                                length,
                                custom_emoji_id: emojiId,
                            },
                            depth,
                        });
                        break;
                    }

                    case 'tg-time': {
                        const unixTime = normalizeTimestamp(props.unix);
                        const format = normalizeTimeFormat(props.format as string | undefined);
                        const timeEntity: DateTimeMessageEntity = {
                            type: 'date_time',
                            offset: startOffset,
                            length,
                            unix_time: unixTime,
                            date_time_format: format ?? '',
                        };
                        rawEntities.push({ entity: timeEntity, depth });
                        break;
                    }

                    default:
                        break;
                }
            }
        }
    };

    traverse(resolved, 0);

    // 2. Sort entities:
    // - offset ascending (earlier in message text first)
    // - length descending (longer / outer span first)
    // - depth ascending (outer ancestor first when spans are identical)
    rawEntities.sort((a, b) => {
        if (a.entity.offset !== b.entity.offset) {
            return a.entity.offset - b.entity.offset;
        }
        if (b.entity.length !== a.entity.length) {
            return b.entity.length - a.entity.length;
        }
        return a.depth - b.depth;
    });

    const entities: MessageEntity[] = rawEntities.map((item) => item.entity);

    // 3. Validate entity range nesting and non-intersection
    validateEntitiesOverlap(entities);

    return {
        text,
        entities,
    };
};
