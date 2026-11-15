# Telegram Markup Example Bot

> Interactive demonstration bot built with [grammY](https://grammy.dev), [Bun](https://bun.sh), and [`@teleframe/view/native`](../packages/native).

This bot demonstrates the full spectrum of `@teleframe/view/native` capabilities: declarative JSX markup, the direct `MessageEntity` compilation pipeline, uniform text sanitization, Telegram nesting rule validation, character limit enforcement, Bot API 9.0 `<tg-time>` date normalization, nested lists, and live in-place message animation.

---

## Interactive Pages & Capabilities

1. **🎨 Typography & Formatting (`/typography`, `/demo`)**:
    - Strongly typed HTML tags (`<Bold>`, `<Italic>`, `<Underline>`, `<Strike>`, `<Spoiler>`, `<Link>`).
    - Semantic paragraph spacing with `<Paragraph>` and `<P>` (or virtual `<p>`).
    - Visual section separation with customizable `<Divider char="─" />`.

2. **💻 Code & Syntax Highlighting (`/code`)**:
    - Inline monospace tokens with `<Code>` (or virtual `<mono>`).
    - Multi-line code blocks with syntax highlighting language markers via `<CodeBlock language="typescript">`.

3. **📋 Lists, Indentation & Iteration (`/lists`)**:
    - Unordered bullet and dash lists (`<Ul>`).
    - Ordered numeric, alphabetical, and Roman numeral lists (`<Ol start={1} numberStyle="roman">`).
    - Item-level indentation with `<Li indent={...}>` and multiline hanging indentation via `<Ul indentMultiline>`.
    - Declarative collection mapping via `<Each items={...} as="ul" | "ol">`.

4. **📊 Progress Bars & Widgets (`/widgets`, `/bars`)**:
    - Visual progress bar styles: `blocks`, `bar`, `circle`, `emoji`, `slider`.
    - Custom prefixes, suffixes, numeric values, percentages, and monospace wrapping (`mono={true}`).
    - Declarative conditional rendering with `<Show when={...} fallback={...}>`.

5. **🕒 Bot API 9.0 Date & Time (`/dates`, `/time`)**:
    - Interactive client-localized timestamps with `<Time>`.
    - Human-friendly aliases: `relative`, `full`, `date-long`, `date-short`, `time-long`, `time-short`, `weekday-date`.
    - Semantic boolean flags: `weekday`, `day`, `month`, `year`, `hour`, `minute`, `second`.
    - Automatic unit normalization (seconds vs milliseconds) and configurable fallback locales.

6. **🎯 Direct MessageEntity Pipeline (`/entities`)**:
    - Primary `render(tree)` compiler producing `{ text, entities }` in a single pass.
    - Exact UTF-16 code unit offset and length calculations for surrogate pair emojis and multilingual text.
    - Direct grammY message delivery (`ctx.reply(text, { entities })`) without parser overhead or escaping errors.

7. **🛡️ Render Security & Nesting Validation (`/safety`)**:
    - Universal dynamic text sanitization: raw brackets, quotes, and malicious scripts render safely as literal text.
    - Strict URL scheme whitelist: `http:`, `https:`, `tg:`, `mailto:`, `tel:`.
    - Explicit escape hatch for author-verified HTML via `<RawHtml html="..." />`.
    - Pre-flight validation against illegal Telegram nesting (e.g. blockquote in blockquote, formatting in code).

8. **📏 Limits & Pre-flight Validation (`/limits`)**:
    - Bot API limit verification: 4,096 characters for messages, 1,024 characters for captions.
    - The _Zero Silent Truncation_ philosophy: prevents corrupted text or sliced surrogate pairs by throwing informative `TelegramLimitError`.
    - Automatic validation options via `render(tree, { validate: 'message' })`.

9. **👤 User Profile Showcase (`/profile`)**:
    - Realistic user card: user mention, identity, VIP tier badge via `<Show>`.
    - Localized registration timestamp with `<Time>`.
    - Activity metrics, storage quota progress bar, and skill badges mapped via `<Each>`.

10. **⏳ Live Animated Progress Bar (`/progress`)**:
    - Real-time in-place message simulation updating every 1000ms.
    - Demonstrates smooth state transitions via `editMessageText` without chat notification noise.
    - Interactive `[ ⏹ Cancel Task ]` and `[ 🔄 Run Again ]` controls.

11. **📖 Architecture Manifesto (`/manifesto`)**:
    - The core philosophy: «A Message is a Page».
    - Historical evolution from `tg-widgets` to declarative JSX.

12. **🧵 Forum Supergroup Topics**:
    - Automatically provisions and manages dedicated threads in Telegram Forum Supergroups:
        - `Native Components`, `Rich Text`, `Interactive Widgets`, and `Telegraph Articles`.

---

## Getting Started

### 1. Launch the Bot

```bash
# Using fnox secrets (recommended):
bun run example

# Or export your token directly:
export TELEGRAM_BOT_TOKEN="your-bot-token-here"
cd example && bun run dev
```

### 2. Type Checking

```bash
cd example && bun run check
```

---

## Project Structure

- **`src/pages/`**: Declarative JSX view templates (`Start`, `Typography`, `Code`, `Lists`, `Widgets`, `Dates`, `Entities`, `Safety`, `Limits`, `Profile`, `LiveProgress`, `Manifesto`).
- **`src/keyboards.ts`**: Interactive inline keyboard navigation menus.
- **`src/callbacks.ts`**: Callback query routing and screen transitions.
- **`src/tasks/`**: Live simulated background tasks with 1s in-place edits.
- **`src/topics/`**: Forum topic detection, automated creation, and thread ID persistence.
- **`src/index.ts`**: Command handlers, topic initialization, and bot lifecycle.
