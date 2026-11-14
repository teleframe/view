/**
 * @fileoverview Visual Progress Bar component for Telegram messages
 * @module @telegram-markup/native/components/progress/progress
 */

import type { TelegramNativeElement } from '../../tags/base';
import { STYLE_PRESETS } from './presets';
import type { ExtendedProgressProps } from './types';

/**
 * Visual Progress Bar for Telegram messages with customizable glyphs,
 * percentages, and ratio counters.
 *
 * @param props - Progress bar options
 * @returns Formatted progress string or virtual code element
 *
 * @example
 * ```tsx
 * <ProgressBar value={45} total={100} showPercent />
 * // ■■■■□□□□□□ 45%
 *
 * <ProgressBar value={8} total={10} style="emoji" showPercent showValue />
 * // 🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜ 80% (8/10)
 *
 * <ProgressBar value={60} style="bar" size={15} showPercent />
 * // █████████░░░░░░ 60%
 *
 * <ProgressBar value={50} style="slider" size={10} />
 * // ━━━━🔘━━━━━
 * ```
 */
export const ProgressBar = ({
    value,
    total,
    max,
    size,
    length,
    style = 'blocks',
    filled,
    empty,
    thumb,
    showPercent = false,
    showValue = false,
    prefix = '',
    suffix = '',
    mono = false,
}: ExtendedProgressProps): TelegramNativeElement | any => {
    const maxTotal = Math.max(1, total ?? max ?? 100);
    const barSize = Math.max(1, size ?? length ?? 10);
    const ratio = Math.max(0, Math.min(1, value / maxTotal));
    const percent = Math.round(ratio * 100);

    const preset = STYLE_PRESETS[style] ?? STYLE_PRESETS.blocks;
    const fillChar = filled ?? preset.filled;
    const emptyChar = empty ?? preset.empty;
    const thumbChar = thumb ?? preset.thumb ?? '🔘';

    let bar = '';

    if (style === 'slider') {
        const thumbPos = Math.min(barSize - 1, Math.floor(ratio * barSize));
        const left = fillChar.repeat(thumbPos);
        const right = emptyChar.repeat(Math.max(0, barSize - 1 - thumbPos));
        bar = `${left}${thumbChar}${right}`;
    } else {
        const filledCount = Math.round(ratio * barSize);
        const emptyCount = Math.max(0, barSize - filledCount);
        bar = `${fillChar.repeat(filledCount)}${emptyChar.repeat(emptyCount)}`;
    }

    const percentLabel = showPercent ? ` ${percent}%` : '';
    const valueLabel = showValue ? ` (${value}/${maxTotal})` : '';

    const output = `${prefix}${bar}${suffix}${percentLabel}${valueLabel}`;

    if (mono) {
        return <code>{output}</code>;
    }

    return output;
};

/**
 * Shorthand alias for `<ProgressBar>`.
 */
export const Progress = ProgressBar;

/**
 * Functional helper for progress bar without JSX.
 */
export const progressBar = (props: ExtendedProgressProps): TelegramNativeElement | any => {
    return ProgressBar(props);
};

/**
 * Functional shorthand alias for `progressBar`.
 */
export const progress = progressBar;

export default ProgressBar;
