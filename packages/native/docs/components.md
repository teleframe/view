# Components Guide

`@telegram-markup/native` provides TypeScript components and functional helpers for text formatting and message layout. TypeScript catches some invalid child combinations; runtime validation remains authoritative.

---

## 1. Typography & Formatting

```tsx
import {
  Bold, Italic, Underline, Strike, Spoiler,
  Link, User, Emoji, Mono, Code, CodeBlock, Pre, Blockquote
} from '@telegram-markup/native';

// Standard formatting:
<Bold>Bold</Bold>
<Italic>Italic</Italic>
<Underline>Underlined</Underline>
<Strike>Strikethrough</Strike>
<Spoiler>Hidden Spoiler</Spoiler>

// Links & User Mentions:
<Link href="https://t.me/example">Channel</Link>
<Link userId={123456789}>Alice</Link>
<User id={123456789}>Alice</User>

// Custom Animated Emoji (Telegram Premium):
<Emoji id="5368324170671202286">👍</Emoji>

// Monospace & Syntax Highlighted Code:
<Mono>token</Mono>
<Code>npm i @telegram-markup/native</Code>
<CodeBlock language="typescript">
  const greeting = "Hello Telegram";
</CodeBlock>

// Quotes (including expandable Telegram quotes):
<Blockquote expandable>
  Tap to expand long terms and conditions.
</Blockquote>
```

---

## 2. Spacing & Dividers

### Clean Line Breaks (`<Br />`)

Template literals often suffer from messy `\n\n` sequences. The `<Br>` component provides clean, readable spacing:

```tsx
import { Br } from '@telegram-markup/native';

<Br />          // 1 line break: '\n'
<Br count={2} /> // 2 line breaks: '\n\n'
<Br count={3} as="br" /> // 3 Telegram HTML breaks: '<br><br><br>'
```

### Paragraphs (`<Paragraph />` / `<P />` / `<p>`)

Visually and semantically separate blocks of text with automatic trailing line breaks:

```tsx
import { Paragraph, P } from '@telegram-markup/native';

// Default spacing appends \n\n (standard paragraph separation)
<Paragraph>
  Welcome to our service! Here you can manage your subscriptions.
</Paragraph>

// Shorthand <P> or intrinsic <p>
<P>
  Please make sure your account is verified.
</P>

// Custom spacing or padding:
<Paragraph spacing={1}>Compact paragraph with 1 newline.</Paragraph>
<Paragraph before={1} after={2}>Custom before and after line breaks.</Paragraph>
```

### Horizontal Dividers (`<Divider />` / `<Hr />`)

```tsx
import { Divider, Hr } from '@telegram-markup/native';

<Divider />                      // \n────────────────────\n
<Divider char="━" length={15} /> // \n━━━━━━━━━━━━━━━\n
<Hr char="=" length={25} before={0} after={1} />
```

---

## 3. Declarative Control Flow

### `<Show>`

Eliminates verbose and error-prone ternary operators. It unwraps truthy values directly into a typed callback:

```tsx
import { Show } from '@telegram-markup/native';

<Show when={user.isVip} fallback={<i>Standard Tier</i>}>
  <b>🌟 VIP Member</b>
</Show>

// Value unwrapping pattern:
<Show when={currentUser}>
  {(user) => <b>Welcome back, {user.name}!</b>}
</Show>
```

### `<Each>`

A high-DX collection mapper supporting multiple presentation layouts:

```tsx
import { Each } from '@telegram-markup/native';

// 1. Plain items with default line breaks
<Each items={['Item 1', 'Item 2', 'Item 3']} />

// 2. Custom inline delimiter
<Each items={tags} separator=" • ">
  {(tag) => `#${tag}`}
</Each>

// 3. Automatic Unordered List
<Each items={fruits} as="ul" marker="— ">
  {(fruit) => <i>{fruit}</i>}
</Each>

// 4. Automatic Ordered List
<Each items={steps} as="ol" start={1}>
  {(step) => step.title}
</Each>
```
