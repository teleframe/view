/**
 * @fileoverview Type definitions for Telegram formatted date & time component
 * @module @teleframe/view/native/components/time/types
 */

import type { TimeChildren } from '../../tags/base';
import type { TimeFormat } from '../../tags/time';

interface TimeBaseProps {
    /** Optional locale for fallback date/time string representation */
    locale?: string;
    /** Optional custom fallback text or generator callback */
    fallback?: string | ((date: Date) => string);
    /** Text-only fallback content (formatting tags are forbidden) */
    children?: TimeChildren;
    key?: string | number | null;
}

type TimeValueProps =
    { date: Date; unix?: never } | { unix: number | string | bigint; date?: never };

type TimeRelativeProps = {
    /** Render as relative time (e.g., "5 minutes ago") -> 'r' */
    relative: true;
    format?: 'relative' | 'rel' | 'ago' | 'r';
    weekday?: never;
    dateShort?: never;
    dateLong?: never;
    timeShort?: never;
    timeLong?: never;
};

type TimeFlagsProps = {
    relative?: false;
    format?: TimeFormat;
    /** Include day of week (e.g., "Monday") -> 'w' */
    weekday?: boolean;
    /** Short date format (e.g., "24/07/2024") -> 'd' */
    dateShort?: boolean;
    /** Long full date format (e.g., "24 July 2024") -> 'D' */
    dateLong?: boolean;
    /** Short time without seconds (e.g., "14:30") -> 't' */
    timeShort?: boolean;
    /** Long time with seconds (e.g., "14:30:45") -> 'T' */
    timeLong?: boolean;
};

/**
 * Properties for `<Time>` formatted date and time component.
 *
 * Guarantees compile-time safety:
 * - Mutually exclusive `date` and `unix`.
 * - Mutually exclusive `relative` and date/time sub-flags.
 * - Format must be a valid alias or Telegram raw format.
 */
export type NativeTimeProps = TimeBaseProps & TimeValueProps & (TimeRelativeProps | TimeFlagsProps);
