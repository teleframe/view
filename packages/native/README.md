# @telegram-markup/native

[![npm version](https://img.shields.io/npm/v/@telegram-markup/native.svg)](https://www.npmjs.com/package/@telegram-markup/native)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.4+-black.svg)](https://bun.sh)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/naylour/telegram-markup)

> **"A Message is a Page"**  
> Native Telegram Bot API markup engine. Compiles declarative JSX/TSX components and zero-JSX functional trees directly into Telegram `MessageEntity[]` data structures and sanitized HTML.

---

## Table of Contents

- [Why @telegram-markup/native?](#why-telegram-markupnative)
- [Installation & Integration Styles](#installation--integration-styles)
    - [Path 1: Dedicated Telegram Bot (Root tsconfig.json)](#path-1-dedicated-telegram-bot-recommended)
    - [Path 2: Monorepo / Multi-Project (Subproject tsconfig.json)](#path-2-monorepo--multi-project)
    - [Path 3: Mixed Files in Web Apps (Per-file Pragma)](#path-3-mixed-files-per-file-pragma)
    - [Path 4: Zero-JSX Functional Builder API (Vanilla TS/JS)](#path-4-zero-jsx-functional-builder-api-vanilla-tsjs)
    - [💡 Best Practice: Mixing Lowercase Helpers inside JSX](#-best-practice-mixing-lowercase-helpers-inside-jsx)
- [Comprehensive Component & Function Reference](#comprehensive-component--function-reference)
    - [1. Typography & Inline Styles](#1-typography--inline-styles)
    - [2. Layout, Spacing & Dividers](#2-layout-spacing--dividers)
    - [3. Lists & Data Iteration](#3-lists--data-iteration)
    - [4. Widgets & Control Flow](#4-widgets--control-flow)
- [Strict Telegram Rules: What is ALLOWED vs What is FORBIDDEN](#strict-telegram-rules-what-is-allowed-vs-what-is-forbidden)
    - [Nesting Rules Matrix](#nesting-rules-matrix)
    - [Compile-Time & Runtime Verification](#compile-time--runtime-verification)
- [Telegram Limits & Validation](#telegram-limits--validation)
- [Security Model & URL Scheme Whitelist](#security-model--url-scheme-whitelist)
- [Client-Side Rendering Differences](#client-side-rendering-differences)
- [Framework Quick Starts](#framework-quick-starts)
    - [Using grammY](#using-grammy)
    - [Using Telegraf](#using-telegraf)
- [License](#license)

---

## Why @telegram-markup/native?

Telegram Bot message formatting has historically been notoriously brittle and error-prone:

- **Entity Offset Corruption**: Telegram Bot API requires `offset` and `length` to be computed in **UTF-16 code units**. Emojis (e.g. 🚀, 👨‍💻) and non-BMP unicode characters consist of surrogate pairs (length 2 in UTF-16, length 1 or 4 in UTF-8). Manual string slicing corrupts offsets and breaks formatting.
- **Parse Mode Crashes**: An unescaped `<`, `>`, or `&` inside user input crashes message delivery with `400 Bad Request: can't parse entities`.
- **Illegal Nesting Rejections**: Telegram strictly rejects formatting inside `<code>`, nested blockquotes, and nested links.
- **Silent Truncation or Crashes on Limits**: Messages exceeding 4,096 characters (or 1,024 for media captions) fail with `400 Bad Request`.

`@telegram-markup/native` solves this once and for all:

1. **Direct `MessageEntity` Compiler (`render`)**: Compiles JSX directly into `{ text, entities }` in a single pass with exact UTF-16 offsets. Zero HTML parsing overhead on Telegram's side.
2. **Sanitized HTML Serializer (`renderToString` / `renderHtml`)**: Produces 100% compliant Telegram HTML for `parse_mode: 'HTML'`.
3. **Pre-flight Error Interception**: Validates nesting rules and character limits locally before sending network requests.
4. **Dual Ergonomics**: Write in JSX (`<Bold>text</Bold>`) or in pure functional TypeScript (`bold('text')`), or mix both!

---

## Installation & Integration Styles

```bash
# Standalone package:
bun add @telegram-markup/native
# or:
npm install @telegram-markup/native

# Or via unified umbrella package:
bun add telegram-markup
# or:
npm install telegram-markup
```

### Path 1: Dedicated Telegram Bot (Recommended)

For projects dedicated to a Telegram bot. Set `jsxImportSource` once in `tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "jsx": "react-jsx",
        "jsxImportSource": "@telegram-markup/native"
    }
}
```

_(If using the umbrella package, set `"jsxImportSource": "telegram-markup"`)._

Usage in any `.tsx` file:

```tsx
import { Bold, Italic, render } from '@telegram-markup/native';

const { text, entities } = render(
    <Bold>
        Hello, <Italic>Telegram!</Italic>
    </Bold>,
);
```

### Path 2: Monorepo / Multi-Project

If you have a web frontend (React/Next.js/Solid) and a Telegram bot backend in the same repository, keep the root `tsconfig.json` for React and configure `apps/bot/tsconfig.json`:

```json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "@telegram-markup/native"
    },
    "include": ["src/**/*"]
}
```

### Path 3: Mixed Files (Per-file Pragma)

In an existing project where you cannot change `tsconfig.json`, add this pragma to the top of your bot template files:

```tsx
/** @jsxImportSource @telegram-markup/native */
import { Bold, render } from '@telegram-markup/native';

export const welcome = (name: string) => render(<Bold>Welcome, {name}!</Bold>);
```

### Path 4: Zero-JSX Functional Builder API (Vanilla TS/JS)

No JSX configuration, no `.tsx` files, and zero `tsconfig.json` setup! Every component is available as a lowercase function:

```ts
import { bold, italic, user, link, br, divider, renderHtml } from '@telegram-markup/native';

const message = [
    bold('Order #1042 Updated'),
    br(2),
    'Customer: ',
    user(12345678, 'Alex'),
    br(),
    'Status: ',
    italic('Delivered'),
    divider('—', 20),
    link('https://example.com/orders/1042', 'Track Order'),
];

const html = renderHtml(message);
```

### 💡 Best Practice: Mixing Lowercase Helpers inside JSX

You don't have to choose between JSX and functional helpers! You can embed lowercase helpers directly inside JSX expressions wherever JSX tags feel too verbose:

```tsx
import { Paragraph, br, divider, emoji, mono, time, user } from '@telegram-markup/native';

const screen = (
    <Paragraph>
        Hello, {user(ctx.from.id, ctx.from.first_name)}! {emoji('5368324170671202286', '👍')}
        {br(2)}
        Registered: {time(user.createdAt, 'relative')}
        {divider('━', 20)}
        API Key: {mono('sk_live_9988776655')}
    </Paragraph>
);
```

---

## Comprehensive Component & Function Reference

All components support:

1. **JSX tag usage:** `<Bold>text</Bold>`
2. **Direct function call:** `Bold('text')`
3. **Lowercase functional helper:** `bold('text')`

### 1. Typography & Inline Styles

| Component                                                    | Lowercase Helper                       | Underlying Tag                         | Description & Examples                                                 |
| :----------------------------------------------------------- | :------------------------------------- | :------------------------------------- | :--------------------------------------------------------------------- |
| `<Bold>`                                                     | `bold(text, tagName?)`                 | `<b>` / `<strong>`                     | Bold styling. Optional `tagName="strong"`.                             |
| `<Italic>`                                                   | `italic(text, tagName?)`               | `<i>` / `<em>`                         | Italic styling. Optional `tagName="em"`.                               |
| `<Underline>`                                                | `underline(text, tagName?)`            | `<u>` / `<ins>`                        | Underline styling. Optional `tagName="ins"`.                           |
| `<Strike>` / `<Strikethrough>`                               | `strike(text, tagName?)`               | `<s>` / `<strike>` / `<del>`           | Strikethrough text styling.                                            |
| `<Spoiler>`                                                  | `spoiler(text)`                        | `<tg-spoiler>`                         | Click-to-reveal spoiler block.                                         |
| `<Code>` / `<Mono>`                                          | `code(text)` / `mono(text)`            | `<code>`                               | Inline monospace snippet. **Only plain text permitted inside**.        |
| `<Pre language="...">`                                       | `pre(text, lang?)`                     | `<pre>`                                | Preformatted block.                                                    |
| `<CodeBlock language="...">`                                 | `codeblock(code, lang?)`               | `<pre><code class="language-...">`     | Multi-line code block with syntax highlighting.                        |
| `<Blockquote expandable>`                                    | `blockquote(children, expandable?)`    | `<blockquote>`                         | Standard or expandable block quotation.                                |
| `<Link href="..." userId={...}>`                             | `link(hrefOrUserId, children)`         | `<a href="...">`                       | Hyperlink or user mention. Protocol must be whitelisted.               |
| `<User id={...}>`                                            | `user(id, children)`                   | `<user id="...">` / `tg://user?id=...` | Telegram user profile mention (`text_mention` entity).                 |
| `<Emoji id="...">`                                           | `emoji(id, fallback)`                  | `<tg-emoji emoji-id="...">`            | Telegram Premium custom emoji. Children must be a single emoji string. |
| `<Time date={...} unix={...} format="..." relative weekday>` | `time(dateOrUnix, format?, fallback?)` | `<tg-time unix="..." format="...">`    | Bot API 9.0 formatted timestamp with live countdown and localization.  |

#### Time Formats & Aliases:

- `relative` (`r`): Dynamic relative time (e.g. "5 minutes ago", "in 2 hours").
- `date-short` (`d`): "24/07/2024".
- `date-long` (`D`): "24 July 2024".
- `time-short` (`t`): "14:30".
- `time-long` (`T`): "14:30:45".
- `weekday` (`w`): Includes day of week (e.g. "Monday").
- Composite: `format="wDt"` -> Day of week, full date, and short time.

---

### 2. Layout, Spacing & Dividers

| Component                                     | Lowercase Helper                           | Props                                                                   | Output & Behavior                                                 |
| :-------------------------------------------- | :----------------------------------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------- |
| `<Br count={2} as="newline" />`               | `br(count?)`                               | `count?: number`, `as?: 'newline' \| 'space'`                           | Appends `\n` line breaks or spaces without messy string literals. |
| `<Paragraph spacing={2}>` / `<P>`             | `paragraph(children, spacing?)` / `p(...)` | `spacing?: number`, `before?: number`                                   | Text block with automatic trailing line breaks (default: 2).      |
| `<Divider char="━" length={20} />` / `<Hr />` | `divider(char?, len?)` / `hr(...)`         | `char?: string`, `length?: number`, `before?: number`, `after?: number` | Formatted horizontal rule. Auto-escapes special characters.       |

---

### 3. Lists & Data Iteration

#### Universal `<List>`, `<Ul>`, `<Ol>`:

```tsx
import { Ul, Ol, Li, List } from '@telegram-markup/native';

// 1. Unordered bullet presets: 'bullet' | 'dash' | 'check' | 'cross' | 'star' | 'arrow'
<Ul bullet="check" spacing={1}>
    <Li>Automated tests passing</Li>
    <Li>Security audit clean</Li>
</Ul>

// 2. Numbered sequence: 'dot' (1.) | 'paren' (1)) | 'roman' (I.) | 'alpha' (A.)
<Ol start={1} numberStyle="roman">
    <Li>Initialize client</Li>
    <Li>Configure webhooks</Li>
</Ol>

// 3. Custom item overrides & multiline indentation:
<Ul indentMultiline>
    <Li marker="⚡" indent={1}>High-priority task with multiple\nlines of detailed notes</Li>
</Ul>
```

#### Declarative Collection Mapping (`<Each>`):

```tsx
import { Each, Li, Ul } from '@telegram-markup/native';

<Each items={users} as="ul" marker="• ">
    {(user, index) => (
        <Li>
            {user.name} ({user.role})
        </Li>
    )}
</Each>;
```

---

### 4. Widgets & Control Flow

#### Visual Progress Bar (`<ProgressBar>` / `progress`):

```tsx
import { ProgressBar, progress } from '@telegram-markup/native';

// Styles: 'blocks' (■■□□) | 'bar' (██░░) | 'circle' (●●○○) | 'emoji' (🟩⬜) | 'slider' (━━🔘━━)
<ProgressBar value={75} total={100} style="bar" showPercent mono />;
// Output: <code>███████░░░ 75%</code>
```

#### Conditional Rendering (`<Show>` / `show`):

```tsx
import { Show, Bold, Italic } from '@telegram-markup/native';

<Show when={user.isVip} fallback={<Italic>Standard Member</Italic>}>
    <Bold>🌟 VIP Member Active</Bold>
</Show>;
```

#### Raw HTML Escape Hatch (`<RawHtml>` / `rawHtml`):

```tsx
import { RawHtml } from '@telegram-markup/native';

// Bypasses entity escaping ONLY for pre-sanitized, trusted HTML:
<RawHtml html="<b>trusted <i>HTML</i> markup</b>" />;
```

---

## Strict Telegram Rules: What is ALLOWED vs What is FORBIDDEN

Telegram Bot API enforces strict syntactic rules. Violating these rules causes messages to fail with `400 Bad Request`. `@telegram-markup/native` validates your tree locally before sending.

### Nesting Rules Matrix

| Outer Tag                                      | Can Contain Formatting (`<b>`, `<i>`, `<u>`, `<s>`)? | Can Contain Links (`<a>`, `<user>`)? | Can Contain Code (`<code>`, `<pre>`)? | Can Contain Blockquote? | Can Contain Emoji / Time? |
| :--------------------------------------------- | :--------------------------------------------------: | :----------------------------------: | :-----------------------------------: | :---------------------: | :-----------------------: |
| **`<b>`, `<i>`, `<u>`, `<s>`, `<tg-spoiler>`** |                        ✅ YES                        |                ✅ YES                |                ✅ YES                 |          ❌ NO          |          ✅ YES           |
| **`<blockquote>`**                             |                        ✅ YES                        |                ✅ YES                |                ✅ YES                 |    ❌ **FORBIDDEN**     |          ✅ YES           |
| **`<Link>`, `<User>`**                         |                        ✅ YES                        |           ❌ **FORBIDDEN**           |                ✅ YES                 |          ❌ NO          |          ✅ YES           |
| **`<Code>`, `<Mono>`**                         |                   ❌ **FORBIDDEN**                   |           ❌ **FORBIDDEN**           |           ❌ **FORBIDDEN**            |          ❌ NO          |     ❌ **FORBIDDEN**      |
| **`<Pre>`, `<CodeBlock>`**                     |                   ❌ **FORBIDDEN**                   |           ❌ **FORBIDDEN**           |    ⚠️ Only `<code>` with language     |          ❌ NO          |     ❌ **FORBIDDEN**      |
| **`<Emoji>`**                                  |                   ❌ **FORBIDDEN**                   |           ❌ **FORBIDDEN**           |           ❌ **FORBIDDEN**            |          ❌ NO          |     ❌ **FORBIDDEN**      |
| **`<Time>` fallback**                          |                   ❌ **FORBIDDEN**                   |           ❌ **FORBIDDEN**           |           ❌ **FORBIDDEN**            |          ❌ NO          |     ❌ **FORBIDDEN**      |

### Key Violations Explained:

1. **NO Blockquotes inside Blockquotes:**
    ```tsx
    // ❌ ILLEGAL (throws TelegramNestingError):
    <blockquote>
        <blockquote>Nested quote</blockquote>
    </blockquote>
    ```
2. **NO Formatting inside Inline Code or Pre:**
    ```tsx
    // ❌ ILLEGAL (throws TelegramNestingError & compile-time TypeScript error):
    <code>
        <b>bold</b> inside code
    </code>
    ```
    Telegram requires code blocks to be literal text.
3. **NO Nested Links:**
    ```tsx
    // ❌ ILLEGAL (throws TelegramNestingError):
    <Link href="https://a.com">
        Click <Link href="https://b.com">here</Link>
    </Link>
    ```
4. **Custom Emoji & Time Fallback are Text-Only:**
    ```tsx
    // ❌ ILLEGAL (throws TelegramNestingError & compile-time error):
    <Emoji id="123">
        <Bold>👍</Bold>
    </Emoji>
    ```

### Compile-Time & Runtime Verification

- **Compile-Time**: Types such as `CodeChildren`, `EmojiChildren`, and `TimeChildren` prevent illegal nesting directly in your IDE.
- **Runtime**: `validateNesting(node)` traverses the virtual tree and throws descriptive `TelegramNestingError` before sending to Telegram.

---

## Telegram Limits & Validation

Telegram Bot API enforces strict character count limits:

| Message Type                                      | Maximum Length                    | Error Thrown on Overflow |
| :------------------------------------------------ | :-------------------------------- | :----------------------- |
| **Standard Message**                              | **4,096 characters**              | `TelegramLimitError`     |
| **Media Caption** (photo, video, audio, document) | **1,024 characters**              | `TelegramLimitError`     |
| **Minimum Length**                                | **1 character** (cannot be empty) | `TelegramLimitError`     |

### How Limits Are Calculated: Telegram-Accurate Parsed Length

> [!IMPORTANT]
> According to the [official Telegram Bot API specification](https://core.telegram.org/bots/api#sendmessage), message and caption length limits are measured in **UTF-16 code units after entities/HTML parsing**.
>
> This means that:
>
> - HTML tags (`<b>`, `</b>`, `<pre>`, `<blockquote expandable>`, etc.) **do not consume** message length limits.
> - Link URLs (e.g. `<a href="https://example.com/very/long/url">label</a>`) **do not consume** message length limits — only the label text counts!
> - HTML entity escapes (e.g. `&amp;`) count as **1 character** (`&`), not 5!
>
> When you pass `validate: 'message'` or `validate: 'caption'` to `renderToString()` or `render()`, the validation engine parses/strips tags and decodes entities before checking length. This guarantees that messages with long URLs or rich markup are **never falsely rejected**.

### Enabling Pre-flight Validation:

```tsx
import { render, renderToString } from '@telegram-markup/native';

// 1. In render() (MessageEntity mode):
const { text, entities } = render(screen, { validate: 'message' });

// 2. For media captions:
const { text: caption, entities: caption_entities } = render(captionTree, { validate: 'caption' });

// 3. In renderToString() (HTML string mode):
const html = renderToString(screen, { validate: 'message' });
```

> [!NOTE]
> `@telegram-markup/native` **never silently truncates** your messages (which could cut off links, code blocks, or critical information). It throws a `TelegramLimitError` detailing the exact length and excess characters.

---

## Security Model & URL Scheme Whitelist

1. **Automatic HTML Entity Escaping**:
   All dynamic expressions, variables, list markers, and divider characters are escaped automatically:
    - `&` → `&amp;`
    - `<` → `&lt;`
    - `>` → `&gt;`
    - `"` → `&quot;`
      Raw user strings containing `<script>` or unmatched brackets will never crash the Telegram parser or execute code.

2. **Strict URL Scheme Whitelist**:
   `<Link href="...">` permits only safe schemes:
    - `https://`
    - `http://`
    - `tg://`
    - `mailto:`
    - `tel:`

    Attempting to use `javascript:`, `data:`, or `vbscript:` immediately throws a security error.

3. **Explicit Raw HTML Escape Hatch (`<RawHtml>` / `rawHtml`)**:
   When you need to insert pre-rendered or author-sanitized HTML directly, use `<RawHtml html="..." />`.

    > [!WARNING]
    > **Dual-Mode Behavior of RawHtml:**
    >
    > - In **HTML mode** (`renderToString` / `renderHtml`), `RawHtml` is inserted directly as-is into the final string without escaping.
    > - In **Entity mode** (`render`), HTML tags are stripped via regex (`<[^>]*>`) to maintain plain-text stream integrity, but pre-encoded HTML entities (such as `&amp;` or `&quot;`) are **not decoded**.
    > - Therefore, `RawHtml` is designed primarily for `parse_mode: 'HTML'`. For 100% identical cross-mode rendering, prefer native JSX components (`<Bold>`, `<Italic>`, `<Link>`, etc.) or zero-JSX functional helpers (`bold()`, `italic()`, `link()`).

---

## Platform & Context Constraints (Telegram Bot API)

Some features depend directly on the bot's account privileges and user privacy settings:

| Feature                   | API Element                             | Telegram Bot API Constraint                                                                                                                                                                                                                                                                        | Reference                                                                   |
| :------------------------ | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **User Mention by ID**    | `<User id={123}>` / `user(123, 'Name')` | Works only if the user has previously interacted with the bot, has open privacy settings, or is a member of the same group chat as the bot. Otherwise, Telegram renders the link or ignores the mention.                                                                                           | [Formatting Options](https://core.telegram.org/bots/api#formatting-options) |
| **Custom Animated Emoji** | `<Emoji id="...">` / `emoji(...)`       | Can only be used by bots that purchased additional usernames on [Fragment](https://fragment.com) or in messages sent by the bot to private, group, and supergroup chats if the owner of the bot has a Telegram Premium subscription. A valid standard emoji must be provided as fallback children. | [Formatting Options](https://core.telegram.org/bots/api#formatting-options) |
| **Nested Quotes**         | `<blockquote>`                          | Telegram Bot API strictly forbids nesting blockquotes inside other blockquotes. Caught pre-flight by `@telegram-markup/native`.                                                                                                                                                                    | [Formatting Options](https://core.telegram.org/bots/api#formatting-options) |

---

## Package Scope & Architecture

`@telegram-markup/native` is purposefully designed as a **focused, zero-dependency message markup and formatting engine**:

- **What it does:**
    - Compiles declarative JSX/TSX and functional trees into Telegram-compliant HTML strings (`parse_mode: 'HTML'`).
    - Compiles declarative trees into native `MessageEntity[]` arrays (`{ text, entities }`) with UTF-16 code unit offset precision.
    - Enforces pre-flight Telegram Bot API nesting rules and length validation.
- **What it does NOT do (by design):**
    - It does **not** make HTTP requests or wrap Telegram Bot API methods (like `sendMessage` or `sendPhoto`).
    - It does **not** build keyboards (`InlineKeyboardMarkup`, `ReplyKeyboardMarkup`).
    - It does **not** manage webhooks or long-polling.

Because it does not tie you to any specific bot framework, you can use `@telegram-markup/native` with **grammY, Telegraf, Puregram, node-telegram-bot-api, or native `fetch`**.

---

## Framework Quick Starts

### Using grammY

```tsx
import { Bot } from 'grammy';
import { Bold, Italic, Link, render, renderToString } from '@telegram-markup/native';

const bot = new Bot(process.env.BOT_TOKEN!);

// Method A: Native MessageEntity (Fastest, zero Telegram parsing overhead)
bot.command('start', async (ctx) => {
    const { text, entities } = render(
        <Bold>
            Welcome, <Italic>{ctx.from?.first_name}</Italic>!
        </Bold>,
    );
    await ctx.reply(text, { entities });
});

// Method B: Sanitized HTML String
bot.command('help', async (ctx) => {
    const html = renderToString(
        <Bold>
            Need Help? Visit our <Link href="https://example.com">Docs</Link>
        </Bold>,
    );
    await ctx.reply(html, { parse_mode: 'HTML' });
});

bot.start();
```

### Using Telegraf

```tsx
import { Telegraf } from 'telegraf';
import { Bold, render, renderToString } from '@telegram-markup/native';

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Native entities
bot.command('profile', async (ctx) => {
    const { text, entities } = render(<Bold>Profile Screen</Bold>);
    await ctx.reply(text, { entities });
});

// HTML mode
bot.command('about', async (ctx) => {
    const html = renderToString(<Bold>About Screen</Bold>);
    await ctx.reply(html, { parse_mode: 'HTML' });
});

bot.launch();
```

---

## License

MIT © [naylour](https://github.com/naylour)
