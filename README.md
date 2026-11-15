# Telegram Markup

[![npm version](https://img.shields.io/npm/v/telegram-markup.svg)](https://www.npmjs.com/package/telegram-markup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-1.4+-black.svg)](https://bun.sh)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](https://github.com/naylour/telegram-markup)

> **"A Message is a Page"**  
> Declarative JSX/TSX markup and message rendering engine for Telegram bots.

---

## Architecture & Packages

`telegram-markup` is a modular, unified ecosystem for Telegram bot formatting:

| Subpackage      | Import Path                                   | Status                  | Description                                             |
| :-------------- | :-------------------------------------------- | :---------------------- | :------------------------------------------------------ |
| **`native`**    | `telegram-markup` or `telegram-markup/native` | **✅ Production Ready** | Native Bot API `MessageEntity` & HTML formatting engine |
| **`richtext`**  | `telegram-markup/richtext`                    | ⏳ _In Development_     | Multi-block structured rich messages and cards          |
| **`widgets`**   | `telegram-markup/widgets`                     | ⏳ _Planned_            | Interactive inline pagination, calendars, keyboards     |
| **`telegraph`** | `telegram-markup/telegraph`                   | ⏳ _Planned_            | Declarative Telegraph article builder and publisher     |

> [!NOTE]
> **Currently Available:**
> At present, the core **`native`** engine is fully available and production-ready. All native components, JSX elements, and lowercase functions can be imported in any of these ways:
>
> - **Directly from root:** `import { Bold, link, render } from 'telegram-markup'`
> - **From the native subpath:** `import { Bold, link, render } from 'telegram-markup/native'`
> - **Via collision-free namespace:** `import { Native } from 'telegram-markup'` (e.g. `<Native.Bold>`, `Native.render()`)
> - **Via standalone scoped package:** `npm install @telegram-markup/native`
>
> 📖 **For exhaustive details on all components, props, nesting constraints, and security guarantees, see the dedicated [Native Package Documentation (`packages/native/README.md`)](./packages/native/README.md)**.

---

## What the Native Engine Provides

The `native` engine powers low-level Telegram Bot API message formatting with bulletproof reliability:

- **Componentized Screens**: Write messages using clean, readable JSX/TSX components (`<Bold>`, `<Italic>`, `<Link>`, `<Ul>`, `<Li>`, `<Br>`, `<Time>`, `<ProgressBar>`).
- **Direct MessageEntity Compiler (`render`)**: Compiles JSX directly into Telegram's native `{ text, entities }` data structure in a single pass with exact UTF-16 code unit offset calculations—zero HTML parsing needed on Telegram's side!
- **Sanitized HTML Mode (`renderToString` / `renderHtml`)**: Generates safe, strictly escaped Telegram HTML for `parse_mode: 'HTML'`.
- **Zero-JSX Functional API**: Call lowercase helpers (`bold()`, `italic()`, `user()`, `br()`, `divider()`, etc.) directly without any JSX compiler or tsconfig setup, or mix them seamlessly inside JSX trees (`{user(id, name)}`, `{emoji(id, fallback)}`, `{time(d, 'relative')}`).
- **Automatic Dynamic Text Sanitization**: User inputs, list markers, and dividers are treated as literal text, neutralizing XSS and entity parsing crashes (`400 Bad Request: can't parse entities`).
- **Pre-flight Error Interception**: Catches illegal tag nesting and message length overflow (1–4096 for messages, 0–1024 for captions) locally before making network requests.
- **Bot API 9.0 `<Time>`**: Declarative timestamps with relative countdowns, format aliases (`date-long`, `time-short`, `full`), and client-side localization.

---

## Installation & Quick Setup

### 1. Install the Package

```bash
# Using Bun (Recommended)
bun add telegram-markup

# Using npm
npm install telegram-markup

# Using pnpm
pnpm add telegram-markup

# Using Yarn
yarn add telegram-markup
```

_(You can also install the scoped standalone package `@telegram-markup/native` directly)._

---

### 2. Choose Your Integration Path

`telegram-markup` offers 4 flexible integration styles designed to fit any architecture—from standalone bots to complex monorepos and zero-JSX scripts.

#### 🚀 Path 1: Dedicated Telegram Bot (Recommended for Bot Projects)

For projects whose primary purpose is a Telegram bot. Configure `tsconfig.json` once and use clean JSX across all `.tsx` files without any pragmas:

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "jsx": "react-jsx",
        "jsxImportSource": "telegram-markup",
        "strict": true
    }
}
```

Usage in `.tsx` files:

```tsx
import { Bold, Italic, Link, render } from 'telegram-markup';

const { text, entities } = render(
    <Bold>
        Hello, <Italic>Telegram!</Italic>
    </Bold>,
);
```

#### 🏢 Path 2: Monorepo / Multi-Project (React/Vue/Solid alongside Telegram Bot)

If you have a monorepo containing a web frontend (React, Next.js) and a Telegram bot backend (`apps/bot` or `packages/bot`), keep your root `tsconfig.json` intact for React and configure `apps/bot/tsconfig.json`:

```json
// apps/bot/tsconfig.json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "telegram-markup"
    },
    "include": ["src/**/*"]
}
```

This isolates the Telegram markup JSX runtime exclusively to your bot directory, eliminating any JSX typing conflicts with React, Solid, or Vue.

#### 🔀 Path 3: Mixed Files in Existing Web Project (Per-File Pragma)

If bot message templates live directly inside an existing React application and you cannot alter `tsconfig.json`, simply add a single pragma line at the top of your bot template files:

```tsx
/** @jsxImportSource telegram-markup */
import { Bold, Italic, render } from 'telegram-markup';

export function makeNotification(username: string) {
    return render(<Bold>Welcome, {username}!</Bold>);
}
```

Only files with this pragma use Telegram Markup's JSX runtime; all other files continue using React.

#### ⚡ Path 4: Zero-JSX Functional Builder API (Vanilla TS/JS, Zero Configuration)

Don't want to configure `tsconfig.json`, configure JSX transforms, or use `.tsx` files?
Every component in `telegram-markup` can be called directly as a function in vanilla `.ts` or `.js` files using intuitive lowercase helpers (`bold`, `italic`, `link`, `user`, `emoji`, `time`, `br`, `divider`, `paragraph`, `codeblock`, `ul`, `ol`, `li`, `show`, `each`, `progress`, etc.) or uppercase constructors (`Bold('text')`, `Italic('text')`):

```ts
import {
    bold,
    italic,
    link,
    user,
    br,
    divider,
    paragraph,
    ul,
    li,
    renderHtml,
    render,
} from 'telegram-markup';

// Pure functional composition with zero JSX compilation needed!
const message = [
    bold('📦 Order #1042 Updated'),
    br(2),
    paragraph(['Customer: ', user(12345678, 'Alex')]),
    ul({
        children: [li(['Status: ', italic('In Transit')]), li(['ETA: ', bold('Today, 18:00')])],
    }),
    divider('—', 20),
    link('https://track.example.com/1042', 'Track Live Location'),
];

// Delivery Method 1: Sanitized HTML string
const html = renderHtml(message);

// Delivery Method 2: Native MessageEntity
const { text, entities } = render(message);
```

#### 🛡️ Collision-Free Namespaced Imports

When mixing multiple markup paradigms or future subpackages (`native`, `richtext`, `widget`), import via the `Native` / `native` namespace:

```tsx
import { Native } from 'telegram-markup';

const screen = (
    <Native.Bold>
        System Status: <Native.Italic>Operational</Native.Italic>
    </Native.Bold>
);

const { text, entities } = Native.render(screen);
```

---

## Quick Start Example

Here is a complete, working example using [grammY](https://grammy.dev):

```tsx
import { Bot } from 'grammy';
import {
    Bold,
    Br,
    Each,
    Italic,
    Li,
    Link,
    ProgressBar,
    Show,
    Time,
    Ul,
    render,
    renderToString,
} from 'telegram-markup';

const bot = new Bot(process.env.BOT_TOKEN!);

// 1. Define your message screen as a declarative JSX component
function UserDashboard({ user, tasks }) {
    return (
        <>
            <Bold>👤 User Dashboard: {user.name}</Bold>
            <Br count={2} />
            <Show when={user.isVip} fallback={<i>Standard Member</i>}>
                <b>🌟 VIP Premium Member</b>
            </Show>
            <Br count={2} />
            <Bold>Member Since:</Bold> <Time date={user.joinedAt} format="date-long" /> (
            <Time date={user.joinedAt} relative />)
            <Br count={2} />
            <Bold>
                Task Completion ({user.completedTasks}/{user.totalTasks}):
            </Bold>
            <Br />
            <ProgressBar
                value={user.completedTasks}
                total={user.totalTasks}
                style="bar"
                showPercent
                mono
            />
            <Br count={2} />
            <Bold>Recent Activities:</Bold>
            <Ul bullet="dash">
                <Each items={tasks}>
                    {(task) => (
                        <Li>
                            <Bold>{task.title}</Bold> — <Link href={task.url}>View Details</Link>
                        </Li>
                    )}
                </Each>
            </Ul>
            <Br />
            <Italic>⚡ Synchronized live via Telegram Bot API</Italic>
        </>
    );
}

// 2. Delivery Method A: Native MessageEntity (Recommended - Zero HTML Parsing Overhead)
bot.command('dashboard', async (ctx) => {
    const { text, entities } = render(
        <UserDashboard
            user={{
                name: 'Alex',
                isVip: true,
                joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
                completedTasks: 8,
                totalTasks: 10,
            }}
            tasks={[
                { title: 'Server Migration', url: 'https://t.me/example' },
                { title: 'Database Optimization', url: 'https://t.me/example' },
            ]}
        />,
        { validate: 'message' }, // Pre-flight check against 4096 character limit
    );

    await ctx.reply(text, { entities });
});

// 3. Delivery Method B: Sanitized Telegram HTML String
bot.command('dashboard_html', async (ctx) => {
    const html = renderToString(
        <UserDashboard
            user={{
                name: 'Alex',
                isVip: true,
                joinedAt: new Date(),
                completedTasks: 5,
                totalTasks: 10,
            }}
            tasks={[{ title: 'Security Audit', url: 'https://t.me/example' }]}
        />,
        { validate: 'message' },
    );

    await ctx.reply(html, { parse_mode: 'HTML' });
});

bot.start();
```

---

## Component Reference

### 1. Typography & Formatting

- `<Bold>` (`<b>`, `<strong>`): Bold text styling.
- `<Italic>` (`<i>`, `<em>`): Italic text styling.
- `<Underline>` (`<u>`, `<ins>`): Underlined text.
- `<Strike>` (`<s>`, `<strike>`, `<del>`): Strikethrough text.
- `<Spoiler>` (`<tg-spoiler>`): Click-to-reveal spoiler block.
- `<Link href="..." userId={...}>` / `<User id={...}>`: Safe hyperlink or Telegram user profile mention (`tg://user?id=...`).
- `<Code>` / `<Mono>`: Inline monospace code snippet.
- `<Pre language="...">` / `<CodeBlock language="...">`: Preformatted code block with syntax highlighting.
- `<Blockquote expandable>`: Standard or expandable block quotation.
- `<Emoji id="...">`: Telegram Premium custom animated emoji (`<tg-emoji>`).

### 2. Layout, Lists & Spacing

- `<Br count={2} />`: Semantic line breaks (`\n` or `<br>`).
- `<Paragraph>` / `<P>`: Text block with automatic trailing paragraph separation.
- `<Divider char="─" length={20} />` / `<Hr />`: Visual horizontal divider.
- `<Ul bullet="bullet" | "dash" | "check" | ...>`: Unordered bullet list with custom markers.
- `<Ol start={1} numberStyle="dot" | "roman" | "alpha" | "paren">`: Ordered list with numbering presets.
- `<Li marker="..." indent={...}>`: Individual list item with item-level marker and indentation overrides.

### 3. Interactive Widgets & Control Flow

- `<ProgressBar value={...} total={...} style="blocks" | "bar" | "circle" | "emoji" | "slider" showPercent mono />`: Visual progress bar.
- `<Time date={...} format="relative" | "date-long" | ... relative weekday />`: Bot API 9.0 localized timestamp with live updates.
- `<Show when={...} fallback={...}>`: Declarative conditional rendering.
- `<Each items={...} as="ul" | "ol" | "plain">`: Declarative array mapping without messy `.map()`.
- `<RawHtml html="..." />`: Explicit escape hatch for trusted pre-formatted HTML markup.

---

## Security Model & Guarantees

1. **Uniform Dynamic Text Sanitization**: All interpolated strings, list markers, dividers, and fallback texts are escaped. Raw strings are never evaluated as markup.
2. **Strict URL Scheme Whitelist**: `<Link href="...">` permits only `https://`, `http://`, `tg://`, `mailto:`, and `tel:`. Dangerous protocols (`javascript:`, `data:`, `vbscript:`) immediately throw security errors.
3. **Pre-flight Nesting Validation**: Automatically validates element nesting according to Telegram Bot API rules (no nested blockquotes, no formatting inside code, no nested links).
4. **Limits Validation**: Optional `{ validate: 'message' | 'caption' }` protects against Telegram 400 errors when message length exceeds 4,096 characters (or 1,024 for media captions).

---

## Development & Monorepo Testing

This project is built using [Bun](https://bun.sh).

```bash
# Install dependencies
bun install

# Format code according to bunfig.toml (4 spaces, single quotes, semicolons)
bun run fmt
bun run fmt:check

# Type-check the monorepo and all packages
bun run check

# Run full test suite (114 passing unit and integration tests)
bun test

# Build production bundles and TypeScript declarations
bun run build

# Start interactive unified example bot
bun run example
```

---

## Documentation & Links

- 📖 **[API Specification](./packages/native/docs/spec.md)** — Exhaustive specification of the compiler contract, limits, and runtime guarantees.
- 🏗️ **[Architecture & Runtime](./packages/native/docs/architecture.md)** — Detailed overview of the JSX runtime, UTF-16 compiler, and sanitizer pipeline.
- 🧩 **[Components Catalog](./packages/native/docs/components.md)** — In-depth guide to all native formatting components.
- 🕒 **[Date/Time & Lists Guide](./packages/native/docs/time-and-lists.md)** — Bot API 9.0 `<Time>` and advanced list formatting.
- 📊 **[Progress Bars Guide](./packages/native/docs/progress.md)** — Visual presets and styling options.
- 🤖 **[Interactive Example Bot](./example)** — Interactive showcase with 12 complete screen examples.
- 📜 **[The Telegram Markup Manifesto: "A Message is a Page"](./PHILOSOPHY.md)** (English) | **[Философия на русском](./PHILOSOPHY.ru.md)**

---

## Author & License

Created by **[Naylour](https://github.com/naylour)** (Telegram: [@naylour](https://t.me/naylour)).  
Licensed under the [MIT License](./LICENSE).
