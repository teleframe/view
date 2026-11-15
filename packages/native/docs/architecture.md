# Architecture & Runtime

`@teleframe/view/native` operates as a dual-target compilation pipeline: **Virtual Element Creation** followed by tree resolution and nesting validation, then either **Direct MessageEntity Compilation** or **HTML Serialization**. Length validation is optional.

```
                  TSX Source Code
                         │
                         ▼
             ┌────────────────────────┐
             │   JSX Runtime Engine   │  <-- packages/native/lib/jsx-runtime.ts
             │  (Tag Normalization)   │
             └────────────────────────┘
                         │
                         ▼ Virtual Telegram Native Tree
             ┌────────────────────────┐
             │  Resolution & Checks  │  <-- tree.ts, validation/
             │  (Nesting; opt. limits)│
             └────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│ MessageEntity Compiler │      │ renderToString Serializer
│ (render -> {text, ...})│      │ (renderToString -> HTML)
└────────────────────────┘      └────────────────────────┘
         │                               │
         ▼                               ▼
Native Bot API Entities           Telegram-Compliant HTML String
```

---

## 1. Virtual Element Engine

When TypeScript or a bundler compiles JSX tags, it delegates calls to our custom JSX runtime:

- **`jsx(type, props, key)`**: Factory for single-child virtual nodes.
- **`jsxs(type, props, key)`**: Factory for multi-child static arrays.
- **`Fragment(props)`**: Lightweight transparent container returning inner children without extra DOM/XML nodes.

Every node is represented by a plain JavaScript object:

```ts
export interface TelegramNativeElement<P = unknown> {
    type: string | ((props: P) => unknown);
    props: P;
    key?: string | number | null;
}
```

---

## 2. Smart Tag Transformations

The JSX runtime includes several compilation passes that bridge web developer ergonomics to Telegram Bot API specifications:

| Input JSX Tag                 | Compiled Telegram Representation      | Rationale                                                |
| :---------------------------- | :------------------------------------ | :------------------------------------------------------- |
| `<user id={123}>User</user>`  | `<a href="tg://user?id=123">User</a>` | Native Telegram inline user mention                      |
| `<mono>code</mono>`           | `<code>code</code>`                   | Idiomatic monospace alias                                |
| `<codeblock language="ts">`   | `<pre><code class="language-ts">`     | Standard Telegram code block highlighting                |
| `<code language="py">`        | `<pre><code class="language-py">`     | Telegram requires `<pre>` parent for syntax highlighting |
| `<tg-time format="relative">` | `<tg-time format="r">`                | Human-friendly time alias normalization                  |

---

## 3. Dual-Target Compilers

### A. Direct MessageEntity Compiler (`render`)

The compiler first resolves function components, validates the resolved tree, then traverses it to build the text and entities. This avoids HTML generation and parsing, though it is not a single-pass traversal of the original tree:

- **UTF-16 Precision**: Calculates all entity offsets and lengths in UTF-16 code units (as required by Telegram Bot API).
- **Zero HTML Parsing**: Emits a `{ text, entities }` object ready to pass directly to `bot.api.sendMessage(chat_id, text, { entities })` or grammY `ctx.reply(text, { entities })`.
- **Entity Sorting & Overlap Check**: Sorts entities by text offset, span length, and source-tree depth for identical spans. An active-ancestor stack checks crossing boundaries and entity compatibility. Flat inputs are processed in linear time after sorting; deeply nested entities may require checking each active ancestor.

### B. HTML Serializer (`renderToString` / `renderHTML`)

The serializer compiles the virtual tree into safe HTML for `parse_mode: 'HTML'`:

- **Selective Escaping**:
    - Inner text is escaped with `escapeHtml` (`&`, `<`, `>`).
    - Attributes are escaped with `escapeAttr` (`&`, `<`, `>`, `"`).
    - Quotes inside text are kept unescaped to match Telegram specifications.
- **Component Resolution**: Function components are evaluated once while resolving the tree, before validation and serialization.
- **Special Tag Handlers**: Void tags like `<br count={2} />` and `<hr />` are transformed directly into line break sequences.

---

## 4. Pre-Flight Validation Pipeline

- **Nesting Rules (`validateNesting`)**: Enforces Telegram Bot API constraints before network requests (e.g. no blockquotes inside blockquotes, no formatting inside inline code, no nested links). Throws `TelegramNestingError` with exact element paths.
- **Length Limits (`validateMessageLength` / `validateCaptionLength`)**: Opt-in pre-flight checks through the `validate` option. Message text is checked against 1–4096 UTF-16 code units and captions against 0–1024. HTML length calculation uses a lightweight tag/entity stripper, not a complete HTML parser. Throws `TelegramLimitError` when enabled and a limit is violated.
