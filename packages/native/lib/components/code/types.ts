/**
 * @fileoverview Type definitions for Code component
 * @module @teleframe/view/native/components/code/types
 */

import type { CodeChildren } from '../../tags/base';
import type { Language } from '../../tags/languages';

/**
 * Properties for `<Code>` component.
 */
export interface NativeCodeProps {
    /** Optional programming language identifier */
    language?: Language;
    /** Monospaced text content (formatting tags are forbidden) */
    children?: CodeChildren;
    key?: string | number | null;
}
