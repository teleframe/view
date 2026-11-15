# Public API Specification: @telegram-markup/native

## 1. Core API Contract

`@telegram-markup/native` provides two rendering pipelines:

1. **`render(tree, options?)` (Primary)**: Compiles the JSX element tree directly into Telegram Bot API `{ text, entities }` data structure in a single pass.
2. **`renderToString(tree, options?)` / `renderHTML(tree)` (Alternative)**: Serializes the JSX element tree into a safe, strictly sanitized Telegram Bot API HTML string for `parse_mode: 'HTML'`.

### 1.1 Types & Signatures

```typescript
export interface RenderOptions {
    /** Validate output length against Telegram Bot API limits */
    validate?: 'message' | 'caption' | false;
    /** Fallback locale for Date/Time formatting (default: system/ISO) */
    locale?: string;
}

export interface RenderResult {
    /** Plain text with all formatting tags stripped */
    text: string;
    /** Array of Telegram Bot API MessageEntity objects */
    entities: MessageEntity[];
}

/**
 * Compiles a Telegram JSX tree into text and MessageEntity array.
 */
export function render(node: NativeChildren, options?: RenderOptions): RenderResult;

/**
 * Serializes a Telegram JSX tree into Telegram-compliant HTML string.
 */
export function renderToString(node: NativeChildren, options?: RenderToStringOptions): string;

export const renderHTML = renderToString;
```

---

## 2. GrammY Integration

Sending messages in grammY without `parse_mode` overhead:

```typescript
import { Bot } from 'grammy';
import { Bold, Italic, render } from '@telegram-markup/native';

const bot = new Bot(process.env.BOT_TOKEN!);

// 1. Text Message
bot.command('status', async (ctx) => {
    const { text, entities } = render(
        <>
            <Bold>System Status: OK</Bold>
            <br />
            <Italic>All microservices operational.</Italic>
        </>
    );

    await ctx.reply(text, { entities });
});

// 2. Media Caption with validation
bot.command('photo', async (ctx) => {
    const { text: caption, entities: caption_entities } = render(
        <Bold>Server Rack #4</Bold>,
        { validate: 'caption' }
    );

    await ctx.replyWithPhoto(photoFile, { caption, caption_entities });
});
```

---

## 3. Package Guarantees & Non-Guarantees

### What the package GUARANTEES:

1. **Telegram Bot API Conformance**:
    - Entities use UTF-16 code units for both `offset` and `length`, as required by Telegram.
    - Entities are properly nested and never overlap or intersect invalidly.
    - All entity properties (`url`, `user`, `language`, `custom_emoji_id`, `unix_time`, `date_time_format`) strictly match Bot API schemas.
2. **Uniform Text Security**:
    - Dynamic text children, list markers, dividers, and fallbacks are treated as plain text, preventing markup injection.
    - In HTML mode, all content is escaped; tags and attributes are restricted to the Telegram Bot API whitelist.
    - Raw HTML injection is only possible via an explicit, unsafe escape hatch (`<RawHtml html="..." />`).
3. **Pre-flight Error Handling**:
    - Invalid tag nesting (e.g., nested blockquotes, formatting inside code) is intercepted before API calls with clear error messages.
    - Message length limits (1–4096 characters for messages, 1–1024 characters for captions) are validated without silent truncation.

### What the package DOES NOT GUARANTEE:

- **Pixel-identical client rendering**: Visual display (fonts, line wraps, emoji rendering, blockquote borders) depends entirely on Telegram client versions and OS platforms (iOS, Android, Desktop, Web). The package guarantees valid data delivery to the Bot API, not identical client pixel rendering.

---

## 4. Bot API Acceptance vs. Client Rendering Quirks

When developing bots, developers frequently encounter discrepancies between what the Telegram Bot API accepts and what end-users visually see in their Telegram apps:

1. **Line Breaks (`<br>` vs `\n`)**:
    - In `MessageEntity` mode, `<br>` and `\n` compile directly into standard `\n` character codes.
    - In HTML mode, `<br>` is output as `<br>` (or newline if configured).
    - _Client Quirk_: Telegram Desktop and Mobile clients render standard `\n` identically. However, consecutive multiple newlines (`\n\n\n`) within blockquotes may be collapsed or visually shortened by some mobile client UI layouts.

2. **Monospace & Code Blocks**:
    - `<Code>` and `<Pre>` emit `code` and `pre` entities accepted by the Bot API.
    - _Client Quirk_: The font family, font size, and tab stop width are determined entirely by the client's OS and theme settings (e.g. Menlo on macOS, Consolas on Windows, Roboto Mono on Android).

3. **Time Formatting (`tg-time` / `date_time` entity)**:
    - The Bot API 9.0+ accepts `date_time` entities with format patterns (e.g., `r` for relative, `d` for date).
    - _Client Quirk_: Clients running Telegram v11.4+ render live interactive localized timestamps. Older clients fall back to rendering the static fallback text provided inside the node.

4. **Expandable Blockquotes & Spoilers**:
    - The Bot API supports `expandable_blockquote` and `spoiler` entities.
    - _Client Quirk_: Legacy third-party or older web clients render expandable blockquotes as standard blockquotes, and spoilers as unhidden text.
