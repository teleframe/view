/**
 * @fileoverview Live test message JSX factories
 * @module example/live/suite-cases
 */

import {
    Blockquote,
    Bold,
    Code,
    Divider,
    Italic,
    Li,
    Link,
    Paragraph,
    Pre,
    ProgressBar,
    RawHtml,
    Spoiler,
    Strike,
    TELEGRAM_LIMITS,
    Time,
    Ul,
    Underline,
    User,
} from '@teleframe/view/native';
import type { BenchmarkResult } from './types';

export const createSuiteIntro = () => (
    <Paragraph>
        <Bold>🔬 Teleframe View — Production Stress &amp; Boundary Test Suite</Bold>
        <br />
        <Italic>Executing automated verification directly via Telegram Bot API:</Italic>
        <Ul>
            <Li marker="⚡ ">High-precision engine performance verification</Li>
            <Li marker="🛡️ ">Bot API nesting matrix &amp; boundary tests</Li>
            <Li marker="📏 ">Exact 4096-character limit enforcement</Li>
            <Li marker="💎 ">Surrogate pairs &amp; multi-code-unit Unicode stability</Li>
        </Ul>
    </Paragraph>
);

export const createExactSpanHtml = (targetChatId: number) => (
    <Paragraph>
        <Bold>🧱 Test: Identical Span Boundaries (HTML)</Bold>
        <br />
        1. Blockquote around Code (same range):
        <Blockquote>
            <Code>const identical_span_code = true;</Code>
        </Blockquote>
        2. Blockquote around Pre:
        <Blockquote>
            <Pre language="typescript">{`const config = { strict: true };`}</Pre>
        </Blockquote>
        3. Blockquote around Link:
        <Blockquote>
            <Link href="https://telegram.org">https://telegram.org</Link>
        </Blockquote>
        4. Blockquote around Time:
        <Blockquote>
            <Time unix={1718000000} format="wdt">
                Monday, June 10, 2024
            </Time>
        </Blockquote>
        5. Blockquote around User mention:
        <Blockquote>
            <User id={targetChatId}>Шахриёр (Exact boundary)</User>
        </Blockquote>
        6. Link inside Bold vs Bold inside Link:
        <br />
        <Link href="https://example.com">
            <Bold>Bold inside Link</Bold>
        </Link>{' '}
        |{' '}
        <Bold>
            <Link href="https://example.com">Link inside Bold</Link>
        </Bold>
    </Paragraph>
);

export const createExactSpanEntities = (targetChatId: number) => (
    <Paragraph>
        <Bold>🎯 Test: Identical Span Boundaries (MessageEntity Mode)</Bold>
        <br />
        Outer containers sorted with lower depth ensure Telegram accepts identical boundaries:
        <Blockquote>
            <Code>console.log("identical boundary in entities mode")</Code>
        </Blockquote>
        <Blockquote>
            <Pre language="json">{`{ "boundary": "identical", "status": "ok" }`}</Pre>
        </Blockquote>
        <Blockquote>
            <Time unix={1718000000} format="r">
                in the future
            </Time>
        </Blockquote>
        <Blockquote>
            <User id={targetChatId}>Шахриёр</User>
        </Blockquote>
        <Link href="https://github.com/teleframe/view">
            <Bold>teleframe/view (Entities)</Bold>
        </Link>
    </Paragraph>
);

export const createSevenLayerCascade = () => (
    <Blockquote>
        <Bold>
            <Italic>
                <Underline>
                    <Strike>
                        <Spoiler>
                            <Link href="https://telegram.org">
                                Layer 7: Blockquote &gt; Bold &gt; Italic &gt; Underline &gt; Strike
                                &gt; Spoiler &gt; Link!
                            </Link>
                        </Spoiler>
                    </Strike>
                </Underline>
            </Italic>
        </Bold>
    </Blockquote>
);

export const createExactLimitMessage = () => {
    const limitHeader = '📏 Test: Ровно 4096 символов (Предельный лимит Bot API sendMessage)\n\n';
    const limitFooter = '\n\n[Конец сообщения ровно 4096 UTF-16 code units. Валидация успешна!]';
    const requiredFillerLength =
        TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH - (limitHeader.length + limitFooter.length);
    const fillerText = '•'.repeat(requiredFillerLength);
    return [
        <Bold>{limitHeader}</Bold>,
        <Blockquote expandable>
            <Italic>{fillerText}</Italic>
        </Blockquote>,
        <Bold>{limitFooter}</Bold>,
    ];
};

export const createUnicodeSurrogateTest = () => (
    <Paragraph>
        <Bold>💎 Test: Unicode Surrogate Pairs &amp; UTF-16 Offsets:</Bold>
        <br />
        🚀 <Bold>Rocket</Bold> 🌍 <Italic>Earth</Italic> ✨ <Underline>Sparkles</Underline> 🔥{' '}
        <Spoiler>Fire</Spoiler>
        <br />
        Complex family emoji (4 code points, 11 UTF-16 units): 👨‍👩‍👧‍👦 | Flag emoji sequence: 🇺🇳 🇬🇧 🇯🇵
        <br />
        <Blockquote>
            <Bold>Mathematical Symbols &amp; Asian Scripts:</Bold>
            <br />∫ f(x)dx = ∑ a_n · x^n | 東京 (Tokyo) | Привет мир! | مرحبا بالعالم
        </Blockquote>
    </Paragraph>
);

export const createRawHtmlEntitiesTest = () => (
    <Paragraph>
        <Bold>🔌 Test: RawHtml Preservation &amp; Numerical Entities:</Bold>
        <br />
        <RawHtml html="<b>Unescaped numerical entities: &#38; and &#x26; must remain literal &amp;#38;</b>" />
        <br />
        <Link href="https://example.com/api?param1=test&amp;param2=val&amp;sort=desc">
            URL with escaped ampersands in query parameters
        </Link>
    </Paragraph>
);
