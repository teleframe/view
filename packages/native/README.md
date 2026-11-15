# Teleframe View — Native Engine (`@teleframe/view/native`)

[![npm version](https://img.shields.io/npm/v/@teleframe/view.svg)](https://www.npmjs.com/package/@teleframe/view)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.4+-black.svg)](https://bun.sh)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/teleframe/view)

> Native Telegram Bot API markup module for `@teleframe/view`. Compiles declarative JSX/TSX components and zero-JSX functional trees directly into Telegram `MessageEntity[]` data structures and sanitized HTML.

---

## Table of Contents

- [Why Native Markup Engine?](#why-native-markup-engine)
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

## Why Native Markup Engine?

Telegram Bot message formatting has historically been notoriously brittle and error-prone:

- **Entity Offset Corruption**: Telegram Bot API requires `offset` and `length` to be computed in **UTF-16 code units**. Emojis (e.g. 🚀, 👨‍💻) and non-BMP unicode characters consist of surrogate pairs (length 2 in UTF-16, length 1 or 4 in UTF-8). Manual string slicing corrupts offsets and breaks formatting.
- **Parse Mode Crashes**: An unescaped `<`, `>`, or `&` inside user input crashes message delivery with `400 Bad Request: can't parse entities`.
- **Illegal Nesting Rejections**: Telegram strictly rejects formatting inside `<code>`, nested blockquotes, and nested links.
- **Silent Truncation or Crashes on Limits**: Messages exceeding 4,096 characters (or 1,024 for media captions) fail with `400 Bad Request`.

`@teleframe/view/native` solves this once and for all:

1. **Direct `MessageEntity` Compiler (`render`)**: Compiles JSX into `{ text, entities }` with UTF-16 offsets, without producing or parsing HTML.
2. **HTML Serializer (`renderToString` / `renderHtml`)**: Escapes ordinary text and emits supported Telegram HTML tags for `parse_mode: 'HTML'`.
3. **Local Validation**: Rejects unsupported nesting during rendering. Message and caption length checks are opt-in through `validate: 'message'` or `validate: 'caption'`.
4. **Dual Ergonomics**: Write in JSX (`<Bold>text</Bold>`) or in pure functional TypeScript (`bold('text')`), or mix both!

---

## Installation & Integration Styles

```bash
# Install @teleframe/view:
bun add @teleframe/view
# or:
npm install @teleframe/view

# In Deno:
deno add npm:@teleframe/view
# or via JSR:
deno add jsr:@teleframe/view
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
        "jsxImportSource": "@teleframe/view"
    }
}
```

Usage in any `.tsx` file:

```tsx
import { Bold, Italic, render } from '@teleframe/view/native';

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
        "jsxImportSource": "@teleframe/view"
    },
    "include": ["src/**/*"]
}
```

### Path 3: Mixed Files (Per-file Pragma)

In an existing project where you cannot change `tsconfig.json`, add this pragma to the top of your bot template files:

```tsx
/** @jsxImportSource @teleframe/view */
import { Bold, render } from '@teleframe/view/native';

export const welcome = (name: string) => render(<Bold>Welcome, {name}!</Bold>);
```

### Path 4: Zero-JSX Functional Builder API (Vanilla TS/JS)

No JSX configuration, no `.tsx` files, and zero `tsconfig.json` setup! Every component is available as a lowercase function:

```ts
import { bold, italic, user, link, br, divider, renderHtml } from '@teleframe/view/native';

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

### Path 5: Deno Projects (`deno.json`)

`@teleframe/view/native` is 100% compatible with Deno 2+:

```json
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "@teleframe/view/native"
    }
}
```

```tsx
import { Bot } from 'npm:grammy';
import { Bold, Italic, render } from '@teleframe/view/native';

const bot = new Bot(Deno.env.get('TELEGRAM_BOT_TOKEN')!);

bot.command('hello', async (ctx) => {
    const { text, entities } = render(
        <Bold>
            Hello from <Italic>Deno!</Italic>
        </Bold>,
    );
    await ctx.reply(text, { entities });
});

bot.start();
```

### 💡 Best Practice: Mixing Lowercase Helpers inside JSX

You don't have to choose between JSX and functional helpers! You can embed lowercase helpers directly inside JSX expressions wherever JSX tags feel too verbose:

```tsx
import { Paragraph, br, divider, emoji, mono, time, user } from '@teleframe/view/native';

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

| Component                                                    | Lowercase Helper                       | Underlying Tag                        | Description & Examples                                                                                 |
| :----------------------------------------------------------- | :------------------------------------- | :------------------------------------ | :----------------------------------------------------------------------------------------------------- |
| `<Bold>`                                                     | `bold(text, tagName?)`                 | `<b>` / `<strong>`                    | Bold styling. Optional `tagName="strong"`.                                                             |
| `<Italic>`                                                   | `italic(text, tagName?)`               | `<i>` / `<em>`                        | Italic styling. Optional `tagName="em"`.                                                               |
| `<Underline>`                                                | `underline(text, tagName?)`            | `<u>` / `<ins>`                       | Underline styling. Optional `tagName="ins"`.                                                           |
| `<Strike>` / `<Strikethrough>`                               | `strike(text, tagName?)`               | `<s>` / `<strike>` / `<del>`          | Strikethrough text styling.                                                                            |
| `<Spoiler>`                                                  | `spoiler(text)`                        | `<tg-spoiler>`                        | Click-to-reveal spoiler block.                                                                         |
| `<Code>` / `<Mono>`                                          | `code(text)` / `mono(text)`            | `<code>`                              | Inline monospace snippet. **Only plain text permitted inside**.                                        |
| `<Pre language="...">`                                       | `pre(text, lang?)`                     | `<pre>`                               | Preformatted block.                                                                                    |
| `<CodeBlock language="...">`                                 | `codeblock(code, lang?)`               | `<pre><code class="language-...">`    | Multi-line code block with syntax highlighting.                                                        |
| `<Blockquote expandable>`                                    | `blockquote(children, expandable?)`    | `<blockquote>`                        | Standard or expandable block quotation.                                                                |
| `<Link href="...">` or `<Link userId={...}>`                 | `link(hrefOrUserId, children)`         | `<a href="...">` / `tg://user?id=...` | Hyperlink or user mention. `href` and `userId` are mutually exclusive.                                 |
| `<User id={...}>`                                            | `user(id, children)`                   | `<a href="tg://user?id=...">`         | Telegram user profile mention (`text_mention` entity).                                                 |
| `<Emoji id="...">`                                           | `emoji(id, fallback)`                  | `<tg-emoji emoji-id="...">`           | Custom emoji ID plus fallback text. The ID is checked for digits; the fallback glyph is not validated. |
| `<Time date={...} unix={...} format="..." relative weekday>` | `time(dateOrUnix, format?, fallback?)` | `<tg-time unix="..." format="...">`   | Bot API 9.0 timestamp with client-side localized rendering when supported.                             |

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

Layout counts and sizes are normalized before repetition: non-finite values use their default, fractional values are truncated, and values are clamped to component-specific bounds (for example, line counts and indentation are capped at 100; divider length is capped at 4,096). This bounds numeric repetition counts; custom strings such as divider characters and progress-bar glyphs remain caller-provided output.

| Component                                     | Lowercase Helper                           | Props                                                                   | Output & Behavior                                            |
| :-------------------------------------------- | :----------------------------------------- | :---------------------------------------------------------------------- | :----------------------------------------------------------- |
| `<Br count={2} as="newline" />`               | `br(count?)`                               | `count?: number`, `as?: 'newline' \| 'br'`                              | Appends newlines; HTML mode also supports `<br>` tags.       |
| `<Paragraph spacing={2}>` / `<P>`             | `paragraph(children, spacing?)` / `p(...)` | `spacing?: number`, `before?: number`                                   | Text block with automatic trailing line breaks (default: 2). |
| `<Divider char="━" length={20} />` / `<Hr />` | `divider(char?, len?)` / `hr(...)`         | `char?: string`, `length?: number`, `before?: number`, `after?: number` | Formatted horizontal rule. Auto-escapes special characters.  |

---

### 3. Lists & Data Iteration

#### Universal `<List>`, `<Ul>`, `<Ol>`:

```tsx
import { Ul, Ol, Li, List } from '@teleframe/view/native';

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
import { Each, Li, Ul } from '@teleframe/view/native';

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
import { ProgressBar, progress } from '@teleframe/view/native';

// Styles: 'blocks' (■■□□) | 'bar' (██░░) | 'circle' (●●○○) | 'emoji' (🟩⬜) | 'slider' (━━🔘━━)
<ProgressBar value={75} total={100} style="bar" showPercent mono />;
// Output: <code>███████░░░ 75%</code>
```

#### Conditional Rendering (`<Show>` / `show`):

```tsx
import { Show, Bold, Italic } from '@teleframe/view/native';

<Show when={user.isVip} fallback={<Italic>Standard Member</Italic>}>
    <Bold>🌟 VIP Member Active</Bold>
</Show>;
```

#### Raw HTML Escape Hatch (`<RawHtml>` / `rawHtml`):

```tsx
import { RawHtml } from '@teleframe/view/native';

// Bypasses entity escaping ONLY for pre-sanitized, trusted HTML:
<RawHtml html="<b>trusted <i>HTML</i> markup</b>" />;
```

---

## Strict Telegram Rules: What is ALLOWED vs What is FORBIDDEN

Telegram Bot API enforces formatting rules. The package validates supported component nesting during rendering; length checks are opt-in, and `RawHtml` contents bypass structural validation.

### Nesting Rules Matrix

| Parent entity                               | Formatting | Links / mentions | Code / pre | Blockquote | Emoji / time |
| :------------------------------------------ | :--------: | :--------------: | :--------: | :--------: | :----------: |
| Formatting (`b`, `i`, `u`, `s`, spoiler)    |     ✅     |        ✅        |     ❌     |     ❌     |      ✅      |
| Blockquote                                  |     ✅     |        ✅        |     ✅     |     ❌     |      ✅      |
| Link / mention (`a`, `user`)                |     ✅     |        ❌        |     ❌     |     ❌     |      ❌      |
| Inline code (`code`)                        |     ❌     |        ❌        |     ❌     |     ❌     |      ❌      |
| Atomic entity (`custom_emoji`, `date_time`) |     ❌     |        ❌        |     ❌     |     ❌     |      ❌      |

`<pre>` contains plain text. For syntax highlighting, HTML may use `<pre><code class="language-ts">…</code></pre>`; the entity renderer represents that structure as one `pre` entity, not nested `pre` and `code` entities.

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

- **Compile-Time**: Child types catch some invalid structures in TypeScript, but do not model every nesting constraint.
- **Runtime**: Rendering validates the resolved tree and throws descriptive `TelegramNestingError`. `RawHtml` contents are opaque to this check.

---

## Telegram Limits & Validation

Telegram Bot API enforces strict character count limits:

| Message Type                                      | Maximum Length       | Error Thrown on Overflow |
| :------------------------------------------------ | :------------------- | :----------------------- |
| **Standard Message**                              | **4,096 characters** | `TelegramLimitError`     |
| **Media Caption** (photo, video, audio, document) | **1,024 characters** | `TelegramLimitError`     |
| **Message minimum length**                        | **1 character**      | `TelegramLimitError`     |
| **Caption minimum length**                        | **0 characters**     | —                        |

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
> When you pass `validate: 'message'` or `validate: 'caption'` to `renderToString()` or `render()`, the package checks the resulting text length. HTML mode uses a lightweight tag/entity stripper for this calculation, not a full HTML parser. Use `RawHtml` only for trusted, well-formed Telegram HTML.

### Enabling Pre-flight Validation:

```tsx
import { render, renderToString } from '@teleframe/view/native';

// 1. In render() (MessageEntity mode):
const { text, entities } = render(screen, { validate: 'message' });

// 2. For media captions:
const { text: caption, entities: caption_entities } = render(captionTree, { validate: 'caption' });

// 3. In renderToString() (HTML string mode):
const html = renderToString(screen, { validate: 'message' });
```

> [!NOTE]
> The package never truncates output. Length validation is opt-in; when enabled, it throws `TelegramLimitError` with the measured length and excess characters.

---

## Security Model & URL Scheme Whitelist

Security validation failures throw the exported `TelegramSecurityError` (`instanceof Error`). Other invalid component arguments may throw a regular `Error`; nesting and length validation use `TelegramNestingError` and `TelegramLimitError`, respectively.

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
    > - Therefore, `RawHtml` is designed primarily for `parse_mode: 'HTML'`. For consistent output between rendering modes, prefer native JSX components (`<Bold>`, `<Italic>`, `<Link>`, etc.) or zero-JSX functional helpers (`bold()`, `italic()`, `link()`).

---

## Platform & Context Constraints (Telegram Bot API)

Some features depend directly on the bot's account privileges and user privacy settings:

| Feature                   | API Element                             | Telegram Bot API Constraint                                                                                                                                                                                                                                                                        | Reference                                                                   |
| :------------------------ | :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **User Mention by ID**    | `<User id={123}>` / `user(123, 'Name')` | Works only if the user has previously interacted with the bot, has open privacy settings, or is a member of the same group chat as the bot. Otherwise, Telegram renders the link or ignores the mention.                                                                                           | [Formatting Options](https://core.telegram.org/bots/api#formatting-options) |
| **Custom Animated Emoji** | `<Emoji id="...">` / `emoji(...)`       | Can only be used by bots that purchased additional usernames on [Fragment](https://fragment.com) or in messages sent by the bot to private, group, and supergroup chats if the owner of the bot has a Telegram Premium subscription. A valid standard emoji must be provided as fallback children. | [Formatting Options](https://core.telegram.org/bots/api#formatting-options) |
| **Nested Quotes**         | `<blockquote>`                          | Telegram Bot API strictly forbids nesting blockquotes inside other blockquotes. Caught pre-flight by `@teleframe/view/native`.                                                                                                                                                                     | [Formatting Options](https://core.telegram.org/bots/api#formatting-options) |

---

## Package Scope & Architecture

`@teleframe/view/native` is purposefully designed as a **focused, no-runtime-dependency message markup and formatting engine**:

- **What it does:**
    - Compiles declarative JSX/TSX and functional trees into Telegram-compliant HTML strings (`parse_mode: 'HTML'`).
    - Compiles declarative trees into native `MessageEntity[]` arrays (`{ text, entities }`) with UTF-16 code unit offset precision.
    - Enforces the implemented nesting rules and offers opt-in message/caption length validation.
- **What it does NOT do (by design):**
    - It does **not** make HTTP requests or wrap Telegram Bot API methods (like `sendMessage` or `sendPhoto`).
    - It does **not** build keyboards (`InlineKeyboardMarkup`, `ReplyKeyboardMarkup`).
    - It does **not** manage webhooks or long-polling.

Because it does not tie you to any specific bot framework, you can use `@teleframe/view/native` with **grammY, Telegraf, Puregram, node-telegram-bot-api, or native `fetch`**.

---

## Framework Quick Starts

### Using grammY

```tsx
import { Bot } from 'grammy';
import { Bold, Italic, Link, render, renderToString } from '@teleframe/view/native';

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
import { Bold, render, renderToString } from '@teleframe/view/native';

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
