/**
 * @fileoverview Type definitions for Line Break components
 * @module @teleframe/view/native/components/br/types
 */

/**
 * Properties for `<Br>`, `<Break>`, and `<NewLine>` line break components.
 */
export interface NativeBrProps {
    /** Number of consecutive line breaks to render (default: 1) */
    count?: number;
    /** Alias for `count` */
    lines?: number;
    /** Format of line break: newline character `\n` or `<br/>` HTML tag (default: 'newline') */
    as?: 'newline' | 'br';
}
