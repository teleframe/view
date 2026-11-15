/**
 * @fileoverview Universal list components (List, Ul, Ol, Li) for Telegram messages
 * @module @telegram-markup/native/components/list/list
 */

import { normalizeInteger } from '../../sanitizer';
import type { TelegramNativeElement } from '../../tags/base';
import type { NativeLiProps, NativeListProps, NativeOlProps, NativeUlProps } from './types';
import { BULLET_PRESETS, flattenChildren, formatNumberMarker } from './utils';

/**
 * List Item component `<Li>`.
 *
 * @param props - Item properties (marker, indent)
 * @returns Virtual list item element
 */
export const Li = ({ children, marker, indent }: NativeLiProps): TelegramNativeElement => {
    return (
        <li marker={marker} indent={indent}>
            {children}
        </li>
    );
};

/**
 * Universal List component supporting bullet, dash, or numbered items.
 *
 * @param props - List container properties
 * @returns Array of rendered items with delimiters
 */
export const List = ({
    type = 'bullet',
    marker,
    start = 1,
    numberStyle = 'dot',
    indent = 0,
    spacing = 1,
    indentMultiline = false,
    children,
}: NativeListProps): any => {
    const items = flattenChildren(children);
    if (items.length === 0) return null;

    const safeSpacing = normalizeInteger(spacing, 1, 1, 100);
    const safeIndent = normalizeInteger(indent, 0, 0, 100);
    const delimiter = '\n'.repeat(safeSpacing);
    const renderedItems: any[] = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemIndex = start + i;

        let itemMarker: string;
        let itemContent: any = item;
        let itemIndentLevel = safeIndent;

        if (item && typeof item === 'object' && (item.type === Li || item.type === 'li')) {
            itemContent = item.props?.children;
            if (item.props?.indent !== undefined) {
                itemIndentLevel = normalizeInteger(item.props.indent, safeIndent, 0, 100);
            }
            if (item.props?.marker !== undefined) {
                itemMarker = item.props.marker;
            } else if (typeof marker === 'function') {
                itemMarker = marker(itemIndex);
            } else if (typeof marker === 'string') {
                itemMarker = BULLET_PRESETS[marker] ?? marker;
            } else if (type === 'number') {
                itemMarker = formatNumberMarker(itemIndex, numberStyle);
            } else if (type === 'dash') {
                itemMarker = '— ';
            } else {
                itemMarker = '• ';
            }
        } else {
            if (typeof marker === 'function') {
                itemMarker = marker(itemIndex);
            } else if (typeof marker === 'string') {
                itemMarker = BULLET_PRESETS[marker] ?? marker;
            } else if (type === 'number') {
                itemMarker = formatNumberMarker(itemIndex, numberStyle);
            } else if (type === 'dash') {
                itemMarker = '— ';
            } else {
                itemMarker = '• ';
            }
        }

        if (itemMarker && !itemMarker.endsWith(' ') && !itemMarker.endsWith('\t')) {
            itemMarker += ' ';
        }

        const indentStr = '  '.repeat(normalizeInteger(itemIndentLevel, 0, 0, 100));

        if (indentMultiline && typeof itemContent === 'string' && itemContent.includes('\n')) {
            const pad = indentStr + ' '.repeat(itemMarker.length);
            itemContent = itemContent
                .split('\n')
                .map((line, idx) => (idx === 0 ? line : `${pad}${line}`))
                .join('\n');
        }

        renderedItems.push([
            indentStr,
            itemMarker,
            itemContent,
            i < items.length - 1 ? delimiter : '\n',
        ]);
    }

    return renderedItems;
};

/**
 * Unordered Bullet / Dash list for Telegram messages.
 */
export const Ul = ({ bullet = 'bullet', ...props }: NativeUlProps): TelegramNativeElement => {
    const marker = BULLET_PRESETS[bullet] ?? bullet;

    return <List type={bullet === 'dash' ? 'dash' : 'bullet'} marker={marker} {...props} />;
};

/**
 * Ordered / Numbered list for Telegram messages.
 */
export const Ol = ({
    start = 1,
    numberStyle = 'dot',
    ...props
}: NativeOlProps): TelegramNativeElement => {
    return <List type="number" start={start} numberStyle={numberStyle} {...props} />;
};

/**
 * Functional helper for List container.
 */
export const list = (props: NativeListProps): any => List(props);

/**
 * Functional helper for Unordered List.
 */
export const ul = (props: NativeUlProps): TelegramNativeElement => Ul(props);

/**
 * Functional helper for Ordered List.
 */
export const ol = (props: NativeOlProps): TelegramNativeElement => Ol(props);

/**
 * Functional helper for List Item: `li('item')` or `li({ marker: '•', children: 'item' })`.
 */
export const li = (propsOrChildren: NativeLiProps | any): TelegramNativeElement => {
    if (
        propsOrChildren &&
        typeof propsOrChildren === 'object' &&
        ('children' in propsOrChildren ||
            'marker' in propsOrChildren ||
            'indent' in propsOrChildren)
    ) {
        return Li(propsOrChildren);
    }
    return Li({ children: propsOrChildren });
};

export default List;
