/**
 * @fileoverview Smoke test suite for Telegram Native markup engine
 * Sends messages directly to user chat via Telegram Bot API
 * Verifies HTML rendering, MessageEntity compilation, and edge cases.
 */

import { bot } from './bot';
import {
    Blockquote,
    Bold,
    Code,
    CodeBlock,
    Divider,
    Each,
    Emoji,
    Italic,
    Li,
    Link,
    Paragraph,
    Pre,
    ProgressBar,
    RawHtml,
    Show,
    Spoiler,
    Strike,
    Time,
    Ul,
    Underline,
    User,
    blockquote,
    bold,
    code,
    divider,
    escapeHtml,
    italic,
    link,
    render,
    renderToString,
    spoiler,
    time,
    underline,
    user,
} from '@telegram-markup/native';

const TARGET_CHAT_ID = 2202303388;

interface TestReport {
    name: string;
    mode: 'HTML' | 'ENTITIES';
    messageId?: number;
    success: boolean;
    error?: string;
    entitiesCount?: number;
}

const reports: TestReport[] = [];

async function sendHtmlTest(name: string, jsxTree: any) {
    try {
        const html = renderToString(jsxTree);
        const res = await bot.api.sendMessage(TARGET_CHAT_ID, html, {
            parse_mode: 'HTML',
        });
        reports.push({
            name,
            mode: 'HTML',
            messageId: res.message_id,
            success: true,
            entitiesCount: res.entities?.length ?? 0,
        });
        console.log(`✓ [HTML] ${name} -> msg_id: ${res.message_id}`);
    } catch (err: any) {
        reports.push({
            name,
            mode: 'HTML',
            success: false,
            error: err.description || err.message,
        });
        console.error(`✗ [HTML] ${name} -> ERROR:`, err.description || err.message);
    }
}

async function sendEntityTest(name: string, jsxTree: any) {
    try {
        const { text, entities } = render(jsxTree);
        const res = await bot.api.sendMessage(TARGET_CHAT_ID, text, {
            entities,
        });
        reports.push({
            name,
            mode: 'ENTITIES',
            messageId: res.message_id,
            success: true,
            entitiesCount: res.entities?.length ?? 0,
        });
        console.log(`✓ [ENTITIES] ${name} -> msg_id: ${res.message_id}`);
    } catch (err: any) {
        reports.push({
            name,
            mode: 'ENTITIES',
            success: false,
            error: err.description || err.message,
        });
        console.error(`✗ [ENTITIES] ${name} -> ERROR:`, err.description || err.message);
    }
}

async function runSmokeTests() {
    console.log(`\n🚀 Starting Telegram Markup Smoke Tests -> Target Chat: ${TARGET_CHAT_ID}`);
    console.log('========================================================================\n');

    // 0. Header Announcement
    await sendHtmlTest(
        '0. Announcement Header',
        <Paragraph>
            <Bold>🧪 Telegram Markup — Production Smoke Test Suite</Bold>
            <br />
            <i>Running live verification of Bot API HTML &amp; Entities pipeline...</i>
        </Paragraph>,
    );

    // 1. Deep Typography Cascade (HTML)
    await sendHtmlTest(
        '1. Deep Typography Cascade (HTML)',
        <Blockquote>
            <Bold>
                <Italic>
                    <Underline>
                        <Strike>
                            <Spoiler>All 5 Nested Typography Styles</Spoiler>
                        </Strike>
                    </Underline>
                </Italic>
            </Bold>
        </Blockquote>,
    );

    // 2. Expandable Blockquote with Code, Links & Lists (HTML)
    await sendHtmlTest(
        '2. Expandable Blockquote with Code & Links (HTML)',
        <Blockquote expandable>
            <Bold>📦 Expandable Documentation Block</Bold>
            <br />
            Here is preformatted inline code: <Code>bun add @telegram-markup/native</Code>
            <br />
            And an official link:{' '}
            <Link href="https://github.com/naylour/telegram-markup">GitHub Repository</Link>
            <Divider char="─" length={24} />
            <Ul>
                <Li marker="✓ ">Zero-dependency runtime</Li>
                <Li marker="✓ ">Bot API 9.0 compatible</Li>
            </Ul>
        </Blockquote>,
    );

    // 3. CodeBlock with Syntax Highlighting (HTML)
    await sendHtmlTest(
        '3. CodeBlock with TypeScript Syntax (HTML)',
        <Paragraph>
            <Bold>💻 Codeblock Component:</Bold>
            <br />
            <CodeBlock language="typescript">
                {`interface UserProfile {
    id: number;
    username: string;
    isPremium: boolean;
}`}
            </CodeBlock>
        </Paragraph>,
    );

    // 4. Special Characters, Ampersands, and Numerical Entities (HTML)
    await sendHtmlTest(
        '4. Escaping & Special Characters (HTML)',
        <Paragraph>
            <Bold>🛡️ Special Characters &amp; Escaping Edge Cases:</Bold>
            <br />
            Characters: &lt;script&gt; &amp; "quotes" &amp; 'single'
            <br />
            Query string URL:{' '}
            <Link href="https://example.com/search?q=telegram&amp;category=bots&amp;sort=asc">
                Safe URL with ampersands
            </Link>
            <br />
            Raw literal entity strings: &amp;#38; and &amp;#x26; (should stay uninterpreted text)
        </Paragraph>,
    );

    // 5. Bot API 9.0 tg-time & User Mentions (HTML)
    await sendHtmlTest(
        '5. Bot API 9.0 Time & User Mention (HTML)',
        <Paragraph>
            <Bold>🕒 Bot API 9.0 Date/Time &amp; User Mention:</Bold>
            <br />
            Relative time:{' '}
            <Time unix={1718000000} format="r">
                in the future
            </Time>
            <br />
            Full date:{' '}
            <Time unix={1718000000} format="D">
                June 10, 2024
            </Time>
            <br />
            Mention by User ID: <User id={TARGET_CHAT_ID}>Шахриёр (You)</User>
        </Paragraph>,
    );

    // 6. RawHtml Integration (HTML)
    await sendHtmlTest(
        '6. RawHtml Escape Hatch (HTML)',
        <Paragraph>
            <Bold>🔌 RawHtml Component:</Bold>
            <br />
            <RawHtml html="<b><i>Trusted Raw HTML Block</i></b> with <code>pre-escaped &amp; safe content</code>" />
        </Paragraph>,
    );

    // 7. Entity Compilation Pipeline (render() Mode)
    await sendEntityTest(
        '7. Entity Compilation Pipeline (render())',
        <Paragraph>
            <Bold>🎯 MessageEntity Direct Compilation Mode</Bold>
            <br />
            <Italic>Sent without parse_mode via Telegram entities array!</Italic>
            <br />
            <Underline>Underlined</Underline> and <Strike>Strikethrough</Strike> and{' '}
            <Spoiler>Spoiler</Spoiler>
            <br />
            Link to author: <Link href="https://github.com/naylour">naylour</Link>
            <br />
            User Mention: <User id={TARGET_CHAT_ID}>Шахриёр</User>
            <br />
            <CodeBlock language="json">
                {`{
  "engine": "@telegram-markup/native",
  "entities": true
}`}
            </CodeBlock>
        </Paragraph>,
    );

    // 8. Surrogate Pairs and Unicode Multibyte Emojis (Entity Mode)
    await sendEntityTest(
        '8. Surrogate Pairs & Emoji UTF-16 Offsets (render())',
        <Paragraph>
            <Bold>💎 Emoji UTF-16 Offset Test:</Bold>
            <br />
            🌍 <Bold>World</Bold> 🚀 <Italic>Rocket</Italic> ✨ <Underline>Sparkles</Underline> 🔥{' '}
            <Spoiler>Fire</Spoiler>
            <br />
            <Blockquote>
                👨‍👩‍👧‍👦 Complex ZWJ emoji sequence followed by <Bold>Bold Text inside Blockquote</Bold>!
            </Blockquote>
        </Paragraph>,
    );

    // 9. Zero-JSX Functional Builder Mode (HTML)
    await sendHtmlTest('9. Zero-JSX Functional Builder (HTML)', [
        bold([
            '⚡ Functional Zero-JSX Builder: ',
            italic('Clean functions without JSX pragma!'),
            '\n',
            underline('Underlined via helper'),
            ' | ',
            spoiler('Spoiler via helper'),
            '\n',
            link('https://github.com/naylour/telegram-markup', 'Documentation Link'),
        ]),
        '\n\n',
        blockquote(['Quotation built via ', code('blockquote()'), ' helper!']),
    ]);

    // 10. Summary Report
    const successCount = reports.filter((r) => r.success).length;
    const totalCount = reports.length;
    await sendHtmlTest(
        '10. Final Summary Report',
        <Paragraph>
            <Bold>📋 Smoke Test Results:</Bold>
            <br />
            <ProgressBar value={successCount} total={totalCount} length={12} showPercent />
            <br />
            Passed:{' '}
            <Bold>
                {successCount} / {totalCount}
            </Bold>{' '}
            tests!
            <br />
            Status:{' '}
            <Bold>
                {successCount === totalCount ? '✅ ALL CHECKS PASSED' : '⚠️ SOME CHECKS FAILED'}
            </Bold>
        </Paragraph>,
    );

    console.log('\n========================================================================');
    console.log(`📊 Smoke Test Summary: ${successCount}/${totalCount} tests passed.`);
    console.log('========================================================================\n');

    if (successCount !== totalCount) {
        process.exit(1);
    }
}

runSmokeTests().catch((err) => {
    console.error('Fatal smoke test runner error:', err);
    process.exit(1);
});
