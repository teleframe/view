/**
 * @fileoverview Formatted Date & Time component `<Time>` for Telegram messages
 * @module @telegram-markup/native/components/time/time
 */

import type { TelegramNativeElement } from '../../tags/base';
import type { TimeFormat } from '../../tags/time';
import { normalizeTimeFormat, normalizeTimestamp } from '../../tags/time';
import type { NativeTimeProps } from './types';

/**
 * Formatted Date & Time component for Telegram Bot API 9.0 `<tg-time>`.
 * Supports both JSX `<Time date={d} />` and functional `time(new Date(), 'relative')`.
 */
export function Time(props: NativeTimeProps): TelegramNativeElement;
export function Time(
    dateOrUnix: Date | number | string | bigint,
    format?: TimeFormat,
    fallback?: string,
): TelegramNativeElement;
export function Time(
    propsOrValue: NativeTimeProps | Date | number | string | bigint,
    formatArg?: TimeFormat,
    fallbackArg?: string,
): TelegramNativeElement {
    let props: any;
    if (propsOrValue instanceof Date) {
        props = { date: propsOrValue, format: formatArg, fallback: fallbackArg };
    } else if (
        typeof propsOrValue === 'number' ||
        typeof propsOrValue === 'bigint' ||
        typeof propsOrValue === 'string'
    ) {
        props = { unix: propsOrValue, format: formatArg, fallback: fallbackArg };
    } else {
        props = propsOrValue;
    }

    const {
        children,
        unix,
        date,
        format,
        relative,
        weekday,
        dateShort,
        dateLong,
        timeShort,
        timeLong,
        locale,
        fallback: fallbackProp,
    } = props ?? {};

    const timestamp = normalizeTimestamp(unix !== undefined ? unix : date);
    const dateObj = new Date(timestamp * 1000);

    let resolvedFormat = format;
    if (!resolvedFormat) {
        if (relative) {
            resolvedFormat = 'r';
        } else {
            let parts = '';
            if (weekday) parts += 'w';
            if (dateLong) parts += 'D';
            else if (dateShort) parts += 'd';
            if (timeLong) parts += 'T';
            else if (timeShort) parts += 't';

            if (parts) resolvedFormat = parts;
        }
    }

    const normalizedFormat = normalizeTimeFormat(resolvedFormat);

    let resolvedFallback = children;
    if (resolvedFallback === undefined || resolvedFallback === null) {
        if (typeof fallbackProp === 'function') {
            resolvedFallback = fallbackProp(dateObj);
        } else if (typeof fallbackProp === 'string') {
            resolvedFallback = fallbackProp;
        } else {
            resolvedFallback = locale ? dateObj.toLocaleString(locale) : dateObj.toLocaleString();
        }
    }

    return (
        <tg-time unix={timestamp} format={normalizedFormat}>
            {resolvedFallback}
        </tg-time>
    );
}

/**
 * Functional helper for formatted date/time without JSX: `time(date, 'relative')` or `time(props)`.
 */
export const time = (
    dateOrUnixOrProps: Date | number | string | bigint | NativeTimeProps,
    format?: TimeFormat,
    fallback?: string,
): TelegramNativeElement => {
    if (typeof dateOrUnixOrProps === 'object' && !(dateOrUnixOrProps instanceof Date)) {
        return Time(dateOrUnixOrProps as NativeTimeProps);
    }
    return Time(dateOrUnixOrProps as Date | number | string | bigint, format, fallback);
};

export default Time;
