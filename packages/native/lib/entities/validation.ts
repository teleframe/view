/**
 * @fileoverview Entity range overlap and boundary nesting validation
 * @module @teleframe/view/native/entities/validation
 */

import { TelegramNestingError } from '../validation/nesting';
import type { MessageEntity } from './types';

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
