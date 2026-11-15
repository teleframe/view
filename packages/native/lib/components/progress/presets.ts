/**
 * @fileoverview Glyphs and style presets for progress bars
 * @module @teleframe/view/native/components/progress/presets
 */

import type { ProgressStyle } from './types';

/**
 * Character configuration presets for progress bars.
 */
export const STYLE_PRESETS: Record<
    ProgressStyle,
    { filled: string; empty: string; thumb?: string }
> = {
    blocks: { filled: '■', empty: '□' },
    bar: { filled: '█', empty: '░' },
    circle: { filled: '●', empty: '○' },
    emoji: { filled: '🟩', empty: '⬜' },
    dots: { filled: '⬝', empty: '·' },
    slider: { filled: '━', empty: '━', thumb: '🔘' },
};
