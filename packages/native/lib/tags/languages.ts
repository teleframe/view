/**
 * @fileoverview Supported programming languages for syntax highlighting in Telegram code blocks
 * @module @teleframe/view/native/tags/languages
 */

/**
 * Standard languages recognized by Telegram Desktop, iOS, and Android clients
 * for syntax highlighting in `<pre><code class="language-...">`.
 */
export type KnownLanguage =
    | 'javascript'
    | 'js'
    | 'typescript'
    | 'ts'
    | 'python'
    | 'py'
    | 'rust'
    | 'rs'
    | 'go'
    | 'c'
    | 'cpp'
    | 'csharp'
    | 'cs'
    | 'java'
    | 'kotlin'
    | 'kt'
    | 'swift'
    | 'html'
    | 'css'
    | 'json'
    | 'yaml'
    | 'sql'
    | 'bash'
    | 'sh'
    | 'dockerfile';

/**
 * Language string for syntax highlighting. Supports known languages with autocomplete,
 * while allowing any custom language identifier string.
 */
export type Language = KnownLanguage | (string & {});
