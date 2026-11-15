# Overview & Philosophy

> **"A Message is a Page"**

`@teleframe/view/native` is a declarative TypeScript/JSX toolkit for constructing Telegram message text with `MessageEntity[]` or Telegram HTML.

---

## The Problem with Traditional Formatting

Developers building Telegram bots historically face three major challenges when formatting text:

1. **Brittle String Concatenation**:
   Constructing messages using template strings (`` `<b>${user.name}</b>` ``) quickly turns code into an unreadable mess of string escapes, messy line breaks, and nested ternaries.
2. **Escaping Nightmares**:
   Telegram HTML parsing is strict. A single unescaped `<`, `>`, or `&` character inside dynamic user data throws an immediate `400 Bad Request: can't parse entities` error, crashing message delivery.
3. **MarkdownV2 Fragility**:
   MarkdownV2 requires escaping 18 different punctuation characters (`_`, `*`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!`). A single mistake in entity byte offsets corrupts the entire layout.

---

## Our Approach: Declarative JSX for Telegram

`@teleframe/view/native` treats Telegram messages as componentized user interfaces:

```tsx
import { Bold, Each, Italic, Link, Show, render, renderToString } from '@teleframe/view/native';

function ProfileCard({ user, orders }) {
    return (
        <>
            <Bold>{user.name}</Bold> — <Link href={`https://t.me/${user.username}`}>Profile</Link>
            <br count={2} />
            <Show when={user.isVip} fallback={<i>Standard Member</i>}>
                <b>🌟 VIP Customer</b>
            </Show>
            <br count={2} />
            <Each items={orders} as="ol" start={1}>
                {(order) => `${order.title} ($${order.price})`}
            </Each>
        </>
    );
}

// 1. Direct native Bot API MessageEntity output (Recommended):
const { text, entities } = render(<ProfileCard user={currentUser} orders={recentOrders} />);
// await ctx.reply(text, { entities });

// 2. Sanitized Telegram HTML output:
const html = renderToString(<ProfileCard user={currentUser} orders={recentOrders} />);
// await ctx.reply(html, { parse_mode: 'HTML' });
```

### Core Design Principles

- **Automatic Sanitization**: All interpolated text is automatically sanitized for Telegram Bot API HTML (`&` $\rightarrow$ `&amp;`, `<` $\rightarrow$ `&lt;`, `>` $\rightarrow$ `&gt;`).
- **No Runtime Dependencies**: The package has no runtime dependencies. Bun and Node.js ESM imports are covered by the package release checks; other runtimes have not been verified as part of this package's release checks.
- **Strict Typing**: Full IntelliSense support for intrinsic Telegram tags (`<b>`, `<code>`, `<tg-spoiler>`, `<tg-time>`, etc.) and high-level layout widgets.
- **Telegram-Focused Validation**: Runtime checks enforce the implemented nesting rules before a result is returned.
