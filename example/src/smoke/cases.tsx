/**
 * @fileoverview Smoke test case definitions
 * @module example/smoke/cases
 */

import {
    Blockquote,
    Bold,
    Code,
    CodeBlock,
    Divider,
    Italic,
    Li,
    Link,
    Paragraph,
    ProgressBar,
    RawHtml,
    Spoiler,
    Strike,
    Time,
    Ul,
    Underline,
    User,
    blockquote,
    bold,
    code,
    italic,
    link,
    spoiler,
    underline,
} from '@teleframe/view/native';
import { TARGET_CHAT_ID } from './runner';

export const createAnnouncement = () => (
    <Paragraph>
        <Bold>🧪 Teleframe View — Production Smoke Test Suite</Bold>
        <br />
        <i>Running live verification of Bot API HTML &amp; Entities pipeline...</i>
    </Paragraph>
);

export const createTypographyCascade = () => (
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
    </Blockquote>
);

export const createExpandableDocs = () => (
    <Blockquote expandable>
        <Bold>📦 Expandable Documentation Block</Bold>
        <br />
        Here is preformatted inline code: <Code>bun add @teleframe/view/native</Code>
        <br />
        And an official link:{' '}
        <Link href="https://github.com/teleframe/view">GitHub Repository</Link>
        <Divider char="─" length={24} />
        <Ul>
            <Li marker="✓ ">Zero-dependency runtime</Li>
            <Li marker="✓ ">Bot API 9.0 compatible</Li>
        </Ul>
    </Blockquote>
);

export const createCodeBlockDemo = () => (
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
    </Paragraph>
);

export const createEscapingDemo = () => (
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
    </Paragraph>
);

export const createBotApi9TimeDemo = () => (
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
    </Paragraph>
);

export const createRawHtmlDemo = () => (
    <Paragraph>
        <Bold>🔌 RawHtml Component:</Bold>
        <br />
        <RawHtml html="<b><i>Trusted Raw HTML Block</i></b> with <code>pre-escaped &amp; safe content</code>" />
    </Paragraph>
);

export const createEntitiesPipelineDemo = () => (
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
  "engine": "@teleframe/view/native",
  "entities": true
}`}
        </CodeBlock>
    </Paragraph>
);

export const createSurrogateEmojiDemo = () => (
    <Paragraph>
        <Bold>💎 Emoji UTF-16 Offset Test:</Bold>
        <br />
        🌍 <Bold>World</Bold> 🚀 <Italic>Rocket</Italic> ✨ <Underline>Sparkles</Underline> 🔥{' '}
        <Spoiler>Fire</Spoiler>
        <br />
        <Blockquote>
            👨‍👩‍👧‍👦 Complex ZWJ emoji sequence followed by <Bold>Bold Text inside Blockquote</Bold>!
        </Blockquote>
    </Paragraph>
);

export const createFunctionalBuilderDemo = () => [
    bold([
        '⚡ Functional Zero-JSX Builder: ',
        italic('Clean functions without JSX pragma!'),
        '\n',
        underline('Underlined via helper'),
        ' | ',
        spoiler('Spoiler via helper'),
        '\n',
        link('https://github.com/teleframe/view', 'Documentation Link'),
    ]),
    '\n\n',
    blockquote(['Quotation built via ', code('blockquote()'), ' helper!']),
];

export const createSummaryReport = (successCount: number, totalCount: number) => (
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
    </Paragraph>
);
