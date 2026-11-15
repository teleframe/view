/**
 * @fileoverview Type definitions for CodeBlock component
 * @module @teleframe/view/native/components/codeblock/types
 */

import type { NativeChildren } from '../../tags/base';
import type { Language } from '../../tags/languages';

/**
 * Properties for `<CodeBlock>` and `<Codeblock>` multi-line code block components.
 */
export interface NativeCodeblockProps {
    /** Programming language for syntax highlighting */
    language?: Language;
    /** Content (text or nested <code>) */
    children?: NativeChildren;
    key?: string | number | null;
}
