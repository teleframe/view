# The Telegram Markup Philosophy: "A Message is a Page"

> **Author**: [Naylour](https://github.com/naylour) (Telegram: [@naylour](https://t.me/naylour))  
> Fullstack Web Developer (Svelte/SvelteKit, Elysia, Hono, Bun), creator of numerous Telegram bots  
> **Status**: Architectural Manifesto & Ecosystem Roadmap

---

## 1. Genesis: Web Standards vs The Stone Age of Telegram Bots

As a fullstack web developer accustomed to the clean ergonomics of modern web tooling (SvelteKit on the frontend, Bun, Elysia, and Hono on the backend), I built dozens of production Telegram bots. Every time, I crashed into a frustrating divide between web development standards and bot tooling.

Standard community plugins (such as `grammY conversations`) are barebones, low-level primitives. Working with them without extensive experience is painful: imperative branching and scattered context turn multi-step forms into spaghetti. When messages are dynamic and stateful with many moving variables, traditional string assembly becomes a nightmare:

```ts
// The traditional, fragile approach:
const text =
    `*Order #${order.id}*\n\nCustomer: ${user.name}\nTotal: *${order.total}$*\n` +
    (order.isExpress ? '⚡ _Express delivery_\n' : '') +
    `\nItems:\n${order.items.map((it, i) => `${i + 1}. ${it.title} — ${it.price}$`).join('\n')}`;
```

Three core pain points haunted every developer:

1. **The Escaping Trap of MarkdownV2 and HTML**: In MarkdownV2, developers must remember 18 reserved characters (`_`, `*`, `[`, `]`, `(`, `)`, `~`, `` ` ``, `>`, `#`, `+`, `-`, `=`, `|`, `{`, `}`, `.`, `!`). A single dot in a username (`John (Dev)`) or an underscore in a SKU (`SKU_123`) crashes the bot with `can't parse entities`. Developers flee to HTML mode, only to hit the exact same trap: any unescaped `<`, `>`, or `&` in user input (`Tom & Jerry`, `a < b`) or an unclosed tag triggers immediate fatal delivery failure.
2. **The Chaos of Update Management (In-place vs New Message)**: Telegram supports message editing (`editMessageText`), but managing it manually is painful. Developers must track message IDs, catch `message is not modified` errors, and handle state race conditions. Lacking an architectural model, developers either give up and spam the chat with new messages, or write heaps of fragile boilerplate.
3. **Unmaintainable & Unscalable Layouts**: Tables, lists, and dynamic data quickly degrade into unreadable string concatenations and arbitrary `\n\n` dividers.

---

## 2. Lessons from `tg-widgets` & Market Research

To bring order to recurring UI patterns, I initially authored [`tg-widgets`](https://www.npmjs.com/package/tg-widgets) (now **deprecated**). It gave developers ready-made tools: paginators, ASCII tables, and interactive menus. But it remained a band-aid over procedural string-gluing chaos.

I then conducted thorough research across Python, JavaScript, and broader ecosystems:

- **Python (`aiogram-dialog`)**: An admirable effort bringing GUI window concepts to FSMs, yet its text rendering delegates to the **Jinja2** template engine (`Jinja("<b>{{ name }}</b>")`). This reverts developers right back to untyped string templates without compiler validation. Meanwhile, `aiogram.utils.formatting` is a procedural builder that becomes unwieldy for composite visual screens.
- **Node.js / TypeScript (`@grammyjs/menu`, `@elumixor/react-telegram`)**: Menu plugins only handle keyboards, leaving message text as raw strings. Meanwhile, attempts to bring React drag along the entire heavy React runtime (hooks, Virtual DOM diffing), which is massive overkill for server-side string output.

Then came the foundational breakthrough:

> **All Telegram message formatting modes (HTML `parse_mode`, Telegraph, cards, and widgets) are inherently a single abstract syntax tree (AST). Exactly like the DOM in web development.**

---

## 3. Adapting SPA Philosophy & The JSX Paradox

Drawing from extensive experience with **SvelteKit**, a clear mental model emerged:

- **The SPA Backend/Server** is our bot runtime (handling database queries, authentication, business logic, FSM states).
- **The Frontend/View** is the Telegram message markup, declared as reactive, reusable UI components.

### Why React Syntax Without React?

As a dedicated Svelte developer, I openly dislike React. Its endless re-render quirks, mental gymnastics with hooks, stale closures, synthetic events, and heavy Virtual DOM have always felt counter-intuitive. React became the industry standard not through architectural perfection, but because it arrived first after AngularJS and jQuery with an approachable component model (Solid later solved reactivity far more elegantly, but arrived much later).

Yet in the context of Telegram bots came a crucial realization: **JSX $\neq$ React**.
JSX is not a framework; it is an exceptionally clean syntactic sugar for declaring abstract syntax trees (AST):

- **Zero React Runtime**: No hooks, no `useEffect`, no Virtual DOM diffing, and zero dependency bloat. Components are pure synchronous functions.
- **Native Runtime Support**: Modern runtimes (**Bun**, **Node.js**, **Deno**) parse JSX out of the box with zero bundler configuration.
- **100% Strict Type Safety**: TypeScript verifies prop contracts and element nesting directly inside the IDE.
- We achieve clean web component architecture with **zero overhead** — the AST compiles directly to Telegram HTML in a single linear pass.

---

## 4. The Conceptual Shift: "A Message is a Page"

- **A bot message is a reactive Page.**
- By default, button clicks trigger seamless `editMessageText` updates in-place.
- The chat stays pristine, and users interact with instant feedback and zero loading delay.

---

## 5. Before and After: A Side-by-Side Comparison

```tsx
// BEFORE: Procedural string hell, manual escaping, manual table/progress formatting
const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const renderOrderPageHtml = (order: Order): string => {
    // Manually calculate column widths and assemble ASCII borders:
    const rows = order.items
        .map(
            (it) =>
                `│ ${escapeHtml(it.title).padEnd(12)} │ ${String(it.qty).padStart(3)} │ ${String(it.price).padStart(6)}$ │`,
        )
        .join('\n');
    const table = `<pre><code>┌──────────────┬─────┬──────────┐\n${rows}\n└──────────────┴─────┴──────────┘</code></pre>`;

    // Manually compute progress bar characters:
    const filled = Math.round((order.progress / 100) * 10);
    const progress = `<code>[${'█'.repeat(filled)}${'░'.repeat(10 - filled)}] ${order.progress}%</code>`;

    // String concatenation with ternaries (missing escapeHtml on any field crashes the bot):
    return (
        `<b>📦 Order #${escapeHtml(order.id)}</b>\n\n` +
        `Customer: ${escapeHtml(order.user.name)}\n\n` +
        table +
        '\n\n' +
        (order.isPriority ? '<b>⚡ Express Delivery</b>\n\n' : '') +
        progress
    );
};

// AFTER: Clean, type-safe, isolated declarative TSX component
const OrderPage = ({ order }: { order: Order }) => (
    <>
        <Paragraph>
            <Bold>📦 Order #{order.id}</Bold>
            <Br />
            Customer: {order.user.name}
        </Paragraph>
        <Table
            data={order.items}
            columns={[
                { header: 'Item', key: 'title', align: 'left' },
                { header: 'Qty', key: 'qty', align: 'center' },
                { header: 'Price', key: 'price', align: 'right' },
            ]}
            style="rounded"
        />
        <Show when={order.isPriority}>
            <P>
                <Bold>⚡ Express Delivery</Bold>
            </P>
        </Show>
        <ProgressBar value={order.progress} total={100} style="bar" showPercent mono />
    </>
);
```

---

## 6. Modular Ecosystem Architecture

1. **`@telegram-markup/native` (Release v0.1.0 — Production Ready)**: automated HTML escaping for `&`, `<`, `>`, semantic `<Paragraph>` / `<P>` dividers, monospaced `<Table>` with CJK/emoji support, dynamic `<ProgressBar>`, list builders (`<Ul>`, `<Ol>`), control flow (`<Show>`, `<Each>`), Bot API 9.0 support (`<tg-time>`, `<tg-emoji>`, quotes).
2. **`@telegram-markup/rich-text` (In Development)**: composite cards, carousels, and content panels.
3. **`@telegram-markup/widget` (Planned)**: stateful forms, date pickers, and paginators with built-in navigation state.
4. **`@telegram-markup/telegraph` (Planned)**: publishing long-form Telegra.ph articles directly from JSX.

---

## 7. The Next Step: `@telegram-markup/router` as a Finite State Machine (FSM)

To replace brittle, imperative `conversations`, we are engineering **`@telegram-markup/router`** for [grammY](https://grammy.dev).

The fundamental architectural principle: **Every `Router` manages the lifecycle of a single interactive message**, while each **`Route` is a screen (an FSM state)** that seamlessly updates that message in-place via `editMessageText`.

For sequential workflows (wizards, profile editors, multi-step settings), routers can be nested as isolated sub-state machines (Sub-FSM):

```tsx
// Primary router bound to an interactive message:
<Router start="catalog">
    <Route path="catalog" component={CatalogPage} />
    <Route path="profile" component={ProfilePage} />

    {/* Nested Sub-FSM router for multi-step form input: */}
    <Route path="profile/edit">
        <Router start="set-fio" mode="in-place">
            <Route path="set-fio" component={SetFioStep} />
            <Route path="set-age" component={SetAgeStep} />
            <Route path="confirm" component={ConfirmStep} />
        </Router>
    </Route>
</Router>
```

**Flexible FSM Modes**:

- **In-place SPA Mode (`mode="in-place"`)**: Edits the active message in-place, automatically managing the navigation history stack for back buttons.
- **New Message Mode (`mode="new-message"`)**: When a flow requires branching into a distinct dialog or modal prompt, the router dispatches a fresh message as an isolated container for a new FSM.

---

## 8. Advantages and Platform Considerations

### Advantages

- 🛡️ **Guaranteed Reliability**: Automated sanitization eliminates parsing crashes entirely.
- 🧩 **Clean Architecture**: Reusable UI components, design systems, and modular screens.
- ⚡ **Ultra-Fast Performance**: Microsecond linear serialization in Bun with zero overhead.

### Platform Considerations & Testing Insights

- **Character Limits**: Telegram enforces a strict 4,096-character limit for message bodies (1,024 for media captions). This official Bot API constraint (carried over from `tg-widgets`) requires multi-page pagination for large datasets.
- **Rate Limits**: Telegram recommends updating messages no faster than once per second to prevent `429 Too Many Requests` penalties.
- **Table Rendering and Android Insights**:
    - Desktop clients (macOS, Windows, Linux) and Telegram Web render `<Table>` in `<pre><code>` with pixel-perfect alignment.
    - Real-world mobile testing (including Telegram Beta on Android) revealed that Android's font renderer can cause column shifts due to non-standard monospace metrics.
    - **Crucial Testing Insight**: This behavior is **completely independent of Telegram's "Compact Mode"** (whether enabled or disabled). Rather than polluting the codebase with fragile mobile hacks, Telegram Markup maintains standard `<pre><code>`. For mobile-centric views, concise 2–3 column tables, `<Ul>`/`<Ol>` lists, or cards are recommended.

---

## License

MIT © [Naylour](https://github.com/naylour) (Telegram: [@naylour](https://t.me/naylour))
