/**
 * @fileoverview Types for explicit unsafe RawHtml escape hatch
 * @module @telegram-markup/native/components/raw-html/types
 */

export interface NativeRawHtmlProps {
    /**
     * Raw unescaped HTML string.
     * WARNING: This content bypasses automatic sanitization.
     */
    html: string;
}
