/**
 * @fileoverview Type definitions for Pre component
 * @module @teleframe/view/native/components/pre/types
 */

import type { NativeChildren } from '../../tags/base';
import type { Language } from '../../tags/languages';

/**
 * Properties for `<Pre>` preformatted block component.
 */
export interface NativePreProps {
    /** Optional programming language identifier for syntax highlighting */
    language?: Language;
    /** Content (text or nested <code>) */
    children?: NativeChildren;
    key?: string | number | null;
}
