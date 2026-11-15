/**
 * @fileoverview Render security and Telegram nesting validation demonstration page
 * @module examples/src/pages/safety
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    CodeBlock,
    Divider,
    Italic,
    Link,
    P,
    Paragraph,
    RawHtml,
    renderToString,
} from '@teleframe/view/native';

/**
 * Demonstrates automatic HTML sanitization, URL scheme validation,
 * explicit raw HTML escape hatch, and Telegram nesting rule validation.
 */
export const SafetyPage = () => {
    // Malicious user-supplied payload with unescaped markup and script injection
    const untrustedUserInput = '<script>alert("pwnd")</script> & "special" <bold>tags</bold>';

    return (
        <>
            {/* Header */}
            <Paragraph>
                <Bold>🛡️ Render Security &amp; Nesting Rules</Bold>
            </Paragraph>
            <P>
                Dynamic user input is one of the primary sources of Telegram Bot API errors.
                <Code>@teleframe/view/native</Code> guarantees pre-flight security and rule
                verification.
            </P>
            <Divider char="─" length={28} />
            {/* 1. Dynamic Text Sanitization */}
            <Bold>1. Dynamic String Sanitization:</Bold>
            <Br />
            Raw input containing brackets, ampersands, or quotes:
            <Br />
            <Italic>{untrustedUserInput}</Italic>
            <Br />
            Notice that the script tag and ampersand are automatically escaped into safe text,
            preventing Telegram <Code>400 Bad Request: can&apos;t parse entities</Code>.
            <Br count={2} />
            {/* 2. Strict URL Validation */}
            <Bold>2. Strict URL Scheme Whitelist:</Bold>
            <Br />• Allowed Schemes: <Code>https://</Code>, <Code>http://</Code>, <Code>tg://</Code>
            , <Code>mailto:</Code>, <Code>tel:</Code>
            <Br />• Blocked Schemes: <Code>javascript:</Code>, <Code>data:</Code>,{' '}
            <Code>vbscript:</Code>
            <Br />
            Attempting to render <Code>{'<Link href="javascript:alert()">Click</Link>'}</Code>{' '}
            immediately throws a security error before sending to Telegram.
            <Br count={2} />
            {/* 3. Explicit Raw HTML Escape Hatch */}
            <Bold>3. Explicit Raw HTML Escape Hatch:</Bold>
            <Br />
            When you explicitly need to inject trusted pre-formatted HTML:
            <Br />
            <RawHtml html={'<b>✅ Rendered safely via &lt;RawHtml /&gt;</b>'} />
            <Br count={2} />
            {/* 4. Pre-flight Nesting Validation */}
            <Blockquote expandable>
                <Bold>📐 Telegram Bot API Nesting Matrix</Bold>
                <Br />
                Telegram enforces strict element hierarchy constraints:
                <Br />• <Bold>Blockquotes</Bold> cannot be nested inside another blockquote.
                <Br />• <Bold>Inline Code</Bold> cannot contain formatting tags (bold, italic,
                etc.).
                <Br />• <Bold>Pre / CodeBlock</Bold> can only wrap code elements.
                <Br />• <Bold>Links</Bold> cannot be nested inside other links.
                <Br />• <Bold>Emoji / Time</Bold> cannot contain inner formatting tags.
                <Br count={2} />
                If code attempts an invalid combination, <Code>TelegramNestingError</Code> is thrown
                instantly with the full element path and actionable remediation advice.
            </Blockquote>
        </>
    );
};

/**
 * Serializes SafetyPage into Telegram Bot API compliant HTML string.
 */
export const renderSafetyPage = (): string => {
    return renderToString(<SafetyPage />);
};

export default SafetyPage;
