/**
 * @fileoverview Single-pass compiler for Telegram Bot API MessageEntity output
 * @module @telegram-markup/native/entities
 */

import { RAW_HTML_TYPE } from './components/raw-html';
import { isValidUrl } from './sanitizer';
import type { NativeChildren } from './tags/base';
import { normalizeTimeFormat, normalizeTimestamp } from './tags/time';
import { validateNesting } from './validation/nesting';

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

/**
 * Validates that all entities are either strictly nested or disjoint,
 * and never overlap/intersect across boundaries.
 */
export const validateEntitiesOverlap = (entities: MessageEntity[]): void => {
    for (let i = 0; i < entities.length; i++) {
        const a = entities[i];
        const aEnd = a.offset + a.length;

        for (let j = i + 1; j < entities.length; j++) {
            const b = entities[j];
            const bEnd = b.offset + b.length;

            if (b.offset >= aEnd) {
                // b starts after a ends -> disjoint
                continue;
            }

            // b starts inside a (b.offset < aEnd).
            // For valid nesting, b must also end within a (bEnd <= aEnd).
            if (bEnd > aEnd) {
                throw new Error(
                    `[Telegram Markup] Entity boundary violation: Entities of type "${a.type}" [${a.offset}..${aEnd}] and "${b.type}" [${b.offset}..${bEnd}] intersect invalidly. In Telegram Bot API, entities must be strictly nested or disjoint.`,
                );
            }
        }
    }
};

/**
 * Compiles a Telegram JSX tree into text and MessageEntity array in a single pass.
 */
export const compileToEntities = (tree: NativeChildren): RenderResult => {
    // 1. Validate tree nesting before compilation
    validateNesting(tree);

    let text = '';
    const rawEntities: MessageEntity[] = [];

    const traverse = (node: unknown): void => {
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
                traverse(child);
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
                traverse(evaluated);
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
                    traverse(props.children);
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
                    traverse(props.children);
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
                    traverse(preChildren);
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
                        rawEntities.push(preEntity);
                    }
                    return;
                }

                const startOffset = text.length;

                // Traverse inner children
                traverse(props.children);

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
                        rawEntities.push({ type: 'bold', offset: startOffset, length });
                        break;

                    case 'i':
                    case 'em':
                        rawEntities.push({ type: 'italic', offset: startOffset, length });
                        break;

                    case 'u':
                    case 'ins':
                        rawEntities.push({ type: 'underline', offset: startOffset, length });
                        break;

                    case 's':
                    case 'strike':
                    case 'del':
                        rawEntities.push({ type: 'strikethrough', offset: startOffset, length });
                        break;

                    case 'tg-spoiler':
                        rawEntities.push({ type: 'spoiler', offset: startOffset, length });
                        break;

                    case 'span': {
                        const cls = props.class ?? props.className;
                        if (cls === 'tg-spoiler') {
                            rawEntities.push({ type: 'spoiler', offset: startOffset, length });
                        }
                        break;
                    }

                    case 'blockquote': {
                        const isExpandable = props.expandable === true;
                        rawEntities.push({
                            type: isExpandable ? 'expandable_blockquote' : 'blockquote',
                            offset: startOffset,
                            length,
                        });
                        break;
                    }

                    case 'code':
                    case 'mono':
                        rawEntities.push({ type: 'code', offset: startOffset, length });
                        break;

                    case 'a': {
                        const href = String(props.href ?? '');
                        if (!isValidUrl(href)) {
                            throw new Error(
                                `[Telegram Markup] Security Error: Invalid or prohibited URL in <a href="${href}">. Only http, https, tg, mailto, and tel schemes are allowed.`,
                            );
                        }

                        if (/^tg:\/\/user\?id=/i.test(href)) {
                            const userIdStr = href.slice('tg://user?id='.length);
                            const userId = Number(userIdStr);
                            rawEntities.push({
                                type: 'text_mention',
                                offset: startOffset,
                                length,
                                user: { id: userId },
                            });
                        } else {
                            rawEntities.push({
                                type: 'text_link',
                                offset: startOffset,
                                length,
                                url: href,
                            });
                        }
                        break;
                    }

                    case 'user': {
                        const userId = Number(props.id);
                        rawEntities.push({
                            type: 'text_mention',
                            offset: startOffset,
                            length,
                            user: { id: userId },
                        });
                        break;
                    }

                    case 'tg-emoji': {
                        const emojiId = String(props['emoji-id'] ?? props.emojiId ?? '');
                        rawEntities.push({
                            type: 'custom_emoji',
                            offset: startOffset,
                            length,
                            custom_emoji_id: emojiId,
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
                        rawEntities.push(timeEntity);
                        break;
                    }

                    default:
                        break;
                }
            }
        }
    };

    traverse(tree);

    // 2. Sort entities: offset ascending, then length descending (outer elements first)
    rawEntities.sort((a, b) => {
        if (a.offset !== b.offset) {
            return a.offset - b.offset;
        }
        return b.length - a.length;
    });

    // 3. Validate entity range nesting and non-intersection
    validateEntitiesOverlap(rawEntities);

    return {
        text,
        entities: rawEntities,
    };
};
