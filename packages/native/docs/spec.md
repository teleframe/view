# Public API Specification: @teleframe/view/native

## 1. Core API Contract

`@teleframe/view/native` provides two rendering pipelines:

1. **`render(tree, options?)`**: Resolves and validates the JSX tree, then compiles it into Telegram Bot API `{ text, entities }` without an HTML round trip.
2. **`renderToString(tree, options?)` / `renderHTML(tree)`**: Resolves and validates the JSX tree, then serializes supported tags and escaped text for `parse_mode: 'HTML'`. `RawHtml` is emitted as-is and is not sanitized.

### 1.1 Types & Signatures

Security validation errors are instances of the exported `TelegramSecurityError`. Nesting and output-length failures use `TelegramNestingError` and `TelegramLimitError`. Other malformed component arguments may throw a regular `Error`.

```typescript
export interface RenderOptions {
    /** Validate output length against Telegram Bot API limits */
    validate?: 'message' | 'caption' | false;
}

// The same validate option is available to renderToString().
// Locale selection belongs to the <Time locale="..."> component, not render options.

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
import { Bold, Italic, render } from '@teleframe/view/native';

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
    - The compiler rejects unsupported nesting and crossing entity ranges for generated entities.
    - Common entity properties are validated and normalized; this is not a substitute for Bot API validation, especially when using `RawHtml` or constructing low-level data yourself.
2. **Uniform Text Security**:
    - Dynamic text children, list markers, dividers, and fallbacks are treated as plain text, preventing markup injection.
    - In HTML mode, ordinary text and supported attributes are escaped; generated tags and attributes are restricted to the implemented whitelist. `RawHtml` is an explicit bypass.
    - Raw HTML injection is only possible via an explicit, unsafe escape hatch (`<RawHtml html="..." />`).
3. **Pre-flight Error Handling**:
    - Invalid tag nesting (e.g., nested blockquotes, formatting inside code) is intercepted before API calls with clear error messages.
    - Message length checks are opt-in via `validate: 'message'` or `validate: 'caption'`. Rendering never truncates output.

### What the package DOES NOT GUARANTEE:

- **Successful delivery or pixel-identical rendering**: The Bot API may reject data based on its current rules, bot permissions, or message context. Visual display also depends on Telegram client versions and platforms.

---

## 4. Bot API Acceptance vs. Client Rendering Quirks

When developing bots, developers frequently encounter discrepancies between what the Telegram Bot API accepts and what end-users visually see in their Telegram apps:

1. **Line Breaks (`<br>` vs `\n`)**:
    - In `MessageEntity` mode, `<br>` and `\n` compile directly into standard `\n` character codes.
    - In HTML mode, the native `<br as="br">` form is output as `<br>` tags; the default form emits newline characters.
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
