/**
 * @fileoverview Architecture manifesto page: "A Message is a Page"
 * @module example/src/pages/manifesto
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    Link,
    P,
    Paragraph,
    renderToString,
} from '@teleframe/view/native';

/**
 * Manifesto page component explaining the core philosophy, the evolution from tg-widgets,
 * and the roadmap of Telegram Markup.
 */
export const ManifestoPage = () => {
    return (
        <>
            {/* Header */}
            <Paragraph>
                <Bold>📖 Manifesto: «A Message is a Page»</Bold>
            </Paragraph>

            <P>
                Author: <Link href="https://github.com/naylour">Naylour</Link> (Telegram:{' '}
                <Link href="https://t.me/naylour">@naylour</Link>)
            </P>

            {/* Core philosophy quote */}
            <Blockquote expandable>
                <Bold>Where did the concept come from?</Bold>
                <Br />
                Historically, Telegram bots were assembled through string concatenation and manual
                Markdown escaping, causing frequent{' '}
                <Code>400 Bad Request: can&apos;t parse entities</Code> errors and spamming user
                chats with new messages on every tap.
                <Br count={2} />
                After authoring <Code>tg-widgets</Code> (now deprecated on npm and GitHub), an
                epiphany emerged: all Telegram presentation formats (Native HTML, Telegraph, Rich
                Text, Widgets) share a single tree-structured nature and should be authored with
                familiar, type-safe JSX/TSX.
            </Blockquote>
            <Br count={2} />

            {/* Why JSX */}
            <Blockquote expandable>
                <Bold>Why JSX instead of Svelte or Astro?</Bold>
                <Br />
                While Svelte and Astro are phenomenal, they are tightly coupled to browser DOM APIs
                and SSR hydration cycles. JSX/TSX provides a lightweight, universal AST that is
                supported natively by Bun, Node.js, and Deno without requiring bundler plugins or
                bloated runtime dependencies.
            </Blockquote>
            <Br count={2} />

            {/* Documentation link */}
            <Link href="https://github.com/teleframe/view/blob/main/PHILOSOPHY.md">
                Read the full philosophy in PHILOSOPHY.md
            </Link>
        </>
    );
};

/**
 * Serializes ManifestoPage into Telegram Bot API compliant HTML string.
 */
export const renderManifestoPage = (): string => {
    return renderToString(<ManifestoPage />);
};

export default ManifestoPage;
