/**
 * @fileoverview Explicit unsafe RawHtml escape hatch
 * @module @teleframe/view/native/components/raw-html/raw-html
 */

import type { TelegramNativeElement } from '../../tags/base';
import type { NativeRawHtmlProps } from './types';

export const RAW_HTML_TYPE = 'telegram:raw_html';

/**
 * Explicit escape hatch for pre-sanitized or author-provided raw HTML.
 * Supports both JSX `<RawHtml html="<b>text</b>" />` and functional `rawHtml('<b>text</b>')`.
 *
 * @warning Bypasses automatic HTML entity escaping. Only use with trusted inputs.
 */
export function RawHtml(props: NativeRawHtmlProps): TelegramNativeElement;
export function RawHtml(html: string): TelegramNativeElement;
export function RawHtml(propsOrHtml: NativeRawHtmlProps | string): TelegramNativeElement {
    const html = typeof propsOrHtml === 'string' ? propsOrHtml : propsOrHtml.html;
    return {
        type: RAW_HTML_TYPE,
        props: { html },
    };
}

/**
 * Functional helper for raw HTML without JSX: `rawHtml('<b>text</b>')`.
 */
export const rawHtml = (htmlOrProps: string | NativeRawHtmlProps): TelegramNativeElement => {
    return typeof htmlOrProps === 'string' ? RawHtml(htmlOrProps) : RawHtml(htmlOrProps);
};

export default RawHtml;
