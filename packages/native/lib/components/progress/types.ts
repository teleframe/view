/**
 * @fileoverview Type definitions and styles for Telegram Native ProgressBar
 * @module @teleframe/view/native/components/progress/types
 */

/**
 * Visual styling theme for progress bars:
 * - `blocks`: `■■■■□□□□□□`
 * - `bar`: `████░░░░░░`
 * - `circle`: `●●●●○○○○○○`
 * - `emoji`: `🟩🟩🟩🟩⬜⬜⬜⬜⬜⬜`
 * - `dots`: `⬝⬝⬝⬝······`
 * - `slider`: `━━━━🔘━━━━━`
 */
export type ProgressStyle = 'blocks' | 'bar' | 'circle' | 'emoji' | 'dots' | 'slider';

/**
 * Properties for progress bar components.
 */
export interface NativeProgressProps {
    /** Current progress numeric value */
    value: number;
    /** Maximum or total value (default: 100) */
    total?: number;
    /** Alias for `total` */
    max?: number;
    /** Total character length of the bar (default: 10) */
    size?: number;
    /** Alias for `size` */
    length?: number;
    /** Visual style preset (default: 'blocks') */
    style?: ProgressStyle;
    /** Custom character for filled portion */
    filled?: string;
    /** Custom character for empty portion */
    empty?: string;
    /** Custom character for slider thumb indicator (for style="slider") */
    thumb?: string;
    /** Whether to append percentage text, e.g. " 45%" (default: false) */
    showPercent?: boolean;
    /** Whether to append fraction value, e.g. " (45/100)" (default: false) */
    showValue?: boolean;
    /** Prefix text placed directly before the bar */
    prefix?: string;
    /** Suffix text placed directly after the bar */
    suffix?: string;
}

/**
 * Extended properties including code styling option.
 */
export interface ExtendedProgressProps extends NativeProgressProps {
    /** Whether to wrap the progress bar in Telegram inline `<code>` monospace */
    mono?: boolean;
}
