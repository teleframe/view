/**
 * @fileoverview Telegram Bot API limits and pre-flight validation demonstration page
 * @module examples/src/pages/limits
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    CodeBlock,
    Divider,
    Italic,
    P,
    Paragraph,
    renderToString,
} from '@telegram-markup/native';

/**
 * Demonstrates pre-flight message and caption length verification,
 * the zero silent truncation philosophy, and TelegramLimitError handling.
 */
export const LimitsPage = () => {
    return (
        <>
            {/* Header */}
            <Paragraph>
                <Bold>📏 Telegram Limits &amp; Validation</Bold>
            </Paragraph>
            <P>
                Telegram Bot API returns <Code>400 Bad Request: message is too long</Code> whenever
                a message or caption exceeds its character quota.
            </P>
            <Divider char="─" length={28} />
            {/* 1. Telegram Quota Limits */}
            <Bold>1. Standard Bot API Quotas:</Bold>
            <Br />• <Bold>Message Text</Bold>: 1 to 4,096 UTF-16 code units.
            <Br />• <Bold>Media Caption</Bold>: 0 to 1,024 UTF-16 code units.
            <Br count={2} />
            {/* 2. Automated Validation Flag */}
            <Bold>2. Built-in Automated Verification:</Bold>
            <Br />
            Pass the <Code>validate</Code> flag directly to <Code>render()</Code> or{' '}
            <Code>renderToString()</Code>:
            <CodeBlock language="typescript">
                {`// Validates message length (1–4096):
const { text, entities } = render(myTree, { validate: 'message' });

// Validates photo/video caption length (0–1024):
const { text: caption } = render(myTree, { validate: 'caption' });`}
            </CodeBlock>
            <Br />
            {/* 3. Zero Silent Truncation Philosophy */}
            <Blockquote expandable>
                <Bold>🚫 The «Zero Silent Truncation» Policy</Bold>
                <Br />
                Many libraries silently truncate long strings with <Code>slice(0, 4096)</Code>.
                <Br count={2} />
                Silent truncation is dangerous: it cuts off critical transactional data, slices
                surrogate pair emojis in half, and corrupts entity range alignments.
                <Br count={2} />
                <Code>@telegram-markup/native</Code> deliberately throws an informative{' '}
                <Code>TelegramLimitError</Code> detailing the exact excess count:
                <Br />
                <Italic>
                    «Message text is 4238 UTF-16 code units, which exceeds the limit of 4096
                    characters by 142.»
                </Italic>
            </Blockquote>
            <Br count={2} />
            {/* 4. Client vs Bot API Rendering Differences */}
            <Blockquote expandable>
                <Bold>📱 Client Rendering Discrepancies</Bold>
                <Br />• <Bold>Line Breaks</Bold>: Both <Code>&lt;br /&gt;</Code> and <Code>\n</Code>{' '}
                compile to standard newlines. Some mobile clients may collapse multiple consecutive
                newlines inside blockquotes.
                <Br />• <Bold>Monospace Fonts</Bold>: <Code>&lt;Code&gt;</Code> and{' '}
                <Code>&lt;Pre&gt;</Code> render using the system monospace font chosen by the user's
                device (e.g. SF Mono on iOS, Menlo on macOS, Consolas on Windows).
            </Blockquote>
        </>
    );
};

/**
 * Serializes LimitsPage into Telegram Bot API compliant HTML string.
 */
export const renderLimitsPage = (): string => {
    return renderToString(<LimitsPage />);
};

export default LimitsPage;
