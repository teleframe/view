/**
 * @fileoverview Resolves and compiles Telegram JSX trees into text and MessageEntity array
 * @module @teleframe/view/native/entities/compiler
 */

import { RAW_HTML_TYPE } from '../components/raw-html';
import { normalizeInteger } from '../sanitizer';
import type { NativeChildren } from '../tags/base';
import { resolveTree } from '../tree';
import { validateNesting } from '../validation/nesting';
import { buildTagEntity } from './tag-entity';
import type { MessageEntity, PreMessageEntity, RenderResult } from './types';
import { validateEntitiesOverlap } from './validation';

export const compileToEntities = (tree: NativeChildren): RenderResult => {
    const resolved = resolveTree(tree);
    validateNesting(resolved);

    let text = '';
    const rawEntities: Array<{ entity: MessageEntity; depth: number }> = [];

    const traverse = (node: unknown, depth: number = 0): void => {
        if (node === null || node === undefined || typeof node === 'boolean') return;
        if (typeof node === 'string') {
            text += node;
            return;
        }
        if (typeof node === 'number') {
            text += String(node);
            return;
        }
        if (Array.isArray(node)) {
            for (const child of node) traverse(child, depth);
            return;
        }
        if (typeof node === 'object' && 'type' in (node as Record<string, unknown>)) {
            const element = node as { type: unknown; props?: Record<string, unknown> };
            if (typeof element.type === 'function') {
                traverse((element.type as (p: unknown) => unknown)(element.props ?? {}), depth);
                return;
            }
            if (element.type === RAW_HTML_TYPE) {
                text += String(element.props?.html ?? '').replace(/<[^>]*>/g, '');
                return;
            }
            if (typeof element.type === 'string') {
                const tag = element.type.toLowerCase();
                const props = element.props ?? {};

                if (tag === 'br') {
                    text += '\n'.repeat(normalizeInteger(props.count ?? props.lines, 1, 1, 100));
                    return;
                }
                if (tag === 'hr') {
                    const char = String(props.char ?? '—');
                    const len = normalizeInteger(props.length, 20, 1, 4096);
                    const before = '\n'.repeat(normalizeInteger(props.before, 1, 0, 100));
                    const after = '\n'.repeat(normalizeInteger(props.after, 1, 0, 100));
                    text += `${before}${char.repeat(len)}${after}`;
                    return;
                }
                if (tag === 'li') {
                    text += `${'  '.repeat(normalizeInteger(props.indent, 0, 0, 100))}${String(props.marker ?? '• ')}`;
                    traverse(props.children, depth);
                    text += '\n';
                    return;
                }
                if (tag === 'p') {
                    text += '\n'.repeat(normalizeInteger(props.before, 0, 0, 100));
                    traverse(props.children, depth);
                    text += '\n'.repeat(
                        normalizeInteger(
                            props.after ?? props.spacing ?? props.lines ?? props.count,
                            2,
                            0,
                            100,
                        ),
                    );
                    return;
                }
                if (tag === 'pre' || tag === 'codeblock') {
                    let language = props.language as string | undefined;
                    let preChildren = props.children;
                    if (
                        preChildren &&
                        typeof preChildren === 'object' &&
                        'type' in (preChildren as Record<string, unknown>)
                    ) {
                        const inner = preChildren as {
                            type: unknown;
                            props?: Record<string, unknown>;
                        };
                        if (inner.type === 'code' || inner.type === 'mono') {
                            const cp = inner.props ?? {};
                            const cls = (cp.class ?? cp.className) as string | undefined;
                            if (typeof cls === 'string' && cls.startsWith('language-'))
                                language = cls.slice('language-'.length);
                            else if (typeof cp.language === 'string') language = cp.language;
                            preChildren = cp.children;
                        }
                    }
                    const preStart = text.length;
                    traverse(preChildren, depth + 1);
                    const preLen = text.length - preStart;
                    if (preLen > 0) {
                        const preEnt: PreMessageEntity = {
                            type: 'pre',
                            offset: preStart,
                            length: preLen,
                        };
                        if (language) preEnt.language = language;
                        rawEntities.push({ entity: preEnt, depth });
                    }
                    return;
                }

                const startOffset = text.length;
                traverse(props.children, depth + 1);
                const length = text.length - startOffset;
                if (length > 0) buildTagEntity(tag, props, startOffset, length, depth, rawEntities);
            }
        }
    };

    traverse(resolved, 0);

    rawEntities.sort((a, b) => {
        if (a.entity.offset !== b.entity.offset) return a.entity.offset - b.entity.offset;
        if (b.entity.length !== a.entity.length) return b.entity.length - a.entity.length;
        return a.depth - b.depth;
    });

    const entities: MessageEntity[] = rawEntities.map((item) => item.entity);
    validateEntitiesOverlap(entities);

    return { text, entities };
};
