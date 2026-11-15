/**
 * @fileoverview Code demonstration page showcasing inline monospace and syntax-highlighted blocks
 * @module examples/native/src/pages/code
 */

import { Bold, Br, Code, CodeBlock, renderToString } from '@telegram-markup/native';

/**
 * Code demonstration component.
 * Showcases inline monospace tokens (`<Code>`) and multi-line code blocks
 * with client-side syntax highlighting (`<CodeBlock language="...">`).
 */
export const CodePage = () => {
    return (
        <>
            {/* Header */}
            <Bold>💻 Monospace &amp; Syntax Highlighted Code</Bold>
            <Br count={2} />
            {/* Inline monospace demonstration */}
            Inline command: <Code>bun run build</Code>
            <Br count={2} />
            {/* TypeScript code block with highlighting */}
            TypeScript Snippet (<Code>{'<CodeBlock language="typescript">'}</Code>):
            <CodeBlock language="typescript">
                {`import { Bot } from 'grammy';
import { Bold, render } from '@telegram-markup/native';

const bot = new Bot(process.env.BOT_TOKEN!);

bot.command('hello', async (ctx) => {
  const html = render(<Bold>Hello from JSX!</Bold>);
  await ctx.reply(html, { parse_mode: 'HTML' });
});`}
            </CodeBlock>
            <Br count={2} />
            {/* Python code block with highlighting */}
            Python Snippet (<Code>{'<CodeBlock language="python">'}</Code>):
            <CodeBlock language="python">
                {`def calculate_summary(items: list[dict]) -> float:
    """Calculates total price from cart items."""
    return sum(item["price"] * item["qty"] for item in items)

print(calculate_summary([{"price": 19.99, "qty": 2}]))`}
            </CodeBlock>
        </>
    );
};

/**
 * Serializes CodePage into Telegram Bot API compliant HTML string.
 *
 * @returns {string} Sanitized HTML string ready for parse_mode: 'HTML'
 */
export const renderCodePage = (): string => {
    return renderToString(<CodePage />);
};

export default CodePage;
