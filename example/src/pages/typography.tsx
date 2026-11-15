/**
 * @fileoverview Typography demonstration page showcasing all native Telegram text formatting tags
 * @module examples/native/src/pages/typography
 */

import {
    Bold,
    Br,
    Code,
    Italic,
    Link,
    Spoiler,
    Strike,
    Time,
    Underline,
    renderToString,
} from '@telegram-markup/native';

/**
 * Typography showcase component.
 * Demonstrates bold, italic, underline, strikethrough, spoilers, hyperlinks,
 * and live localized relative/absolute dates via Telegram Bot API 9.0 `<tg-time>`.
 */
export const TypographyPage = () => {
    return (
        <>
            {/* Page Header */}
            <Bold>🎨 Typography &amp; Text Formatting</Bold>
            <Br count={2} />
            {/* Feature showcase list */}
            All standard Telegram Bot API HTML formatting tags are strongly typed:
            <Br />• <Bold>Bold Text</Bold> (<Code>{'<Bold>'}</Code> or <Code>{'<b>'}</Code>)
            <Br />• <Italic>Italicized Emphasis</Italic> (<Code>{'<Italic>'}</Code> or{' '}
            <Code>{'<i>'}</Code>)
            <Br />• <Underline>Underlined Content</Underline> (<Code>{'<Underline>'}</Code> or{' '}
            <Code>{'<u>'}</Code>)
            <Br />• <Strike>Strikethrough / Removed</Strike> (<Code>{'<Strike>'}</Code> or{' '}
            <Code>{'<s>'}</Code>)
            <Br />• <Spoiler>Hidden Spoiler Content</Spoiler> (<Code>{'<Spoiler>'}</Code>)
            <Br />• <Link href="https://telegram.org">Official Telegram Portal</Link> (
            <Code>{'<Link>'}</Code>)
            <Br />
            {/* Dynamic Date & Time formatting via <Time> */}
            • Relative Time: <Time date={new Date()} relative /> (<Code>{'<Time relative />'}</Code>
            )
            <Br />
            • Full Localized DateTime: <Time date={new Date()} format="full" /> (
            <Code>{'<Time format="full" />'}</Code>)
            <Br />• Paragraphs: <Code>{'<Paragraph>'}</Code> or <Code>{'<P>'}</Code> (semantic line
            break separation)
            <Br count={2} />
            {/* In-place update indicator */}
            <Italic>
                ⚡ Screen updated in-place without generating message notification spam.
            </Italic>
        </>
    );
};

/**
 * Serializes TypographyPage into Telegram Bot API compliant HTML string.
 *
 * @returns {string} Sanitized HTML string ready for parse_mode: 'HTML'
 */
export const renderTypographyPage = (): string => {
    return renderToString(<TypographyPage />);
};

export default TypographyPage;
