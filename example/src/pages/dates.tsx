/**
 * @fileoverview Bot API 9.0 Date and Time formatting demonstration page
 * @module examples/src/pages/dates
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    Divider,
    Italic,
    Link,
    P,
    Paragraph,
    Time,
    renderToString,
} from '@telegram-markup/native';

/**
 * Demonstrates Telegram Bot API 9.0 `<tg-time>` support, time aliases,
 * boolean flags, milliseconds normalization, and configurable fallback rendering.
 */
export const DatesPage = () => {
    const fixedTimestamp = 1718000000; // June 10, 2024
    const now = new Date();

    return (
        <>
            {/* Header */}
            <Paragraph>
                <Bold>🕒 Bot API 9.0 Date &amp; Time Formatting</Bold>
            </Paragraph>
            <P>
                Telegram Bot API 9.0 introduces native interactive timestamps rendered by Telegram
                clients (v11.4+) into the user&apos;s local device time and preferred format.
            </P>
            <Divider char="─" length={28} />
            {/* 1. Relative Time Presets */}
            <Bold>1. Relative Countdown &amp; Elapsed Time:</Bold>
            <Br />
            • In 2 hours: <Time date={new Date(Date.now() + 7200000)} relative />
            <Br />
            • 5 minutes ago: <Time date={new Date(Date.now() - 300000)} relative />
            <Br count={2} />
            {/* 2. Format Aliases */}
            <Bold>2. Human-Friendly Format Aliases:</Bold>
            <Br />• <Code>full</Code>:{' '}
            <Time unix={fixedTimestamp} format="full" locale="en-US">
                June 10, 2024, 6:13 AM
            </Time>
            <Br />• <Code>date-long</Code>:{' '}
            <Time unix={fixedTimestamp} format="date-long" locale="en-US">
                June 10, 2024
            </Time>
            <Br />• <Code>date-short</Code>:{' '}
            <Time unix={fixedTimestamp} format="date-short" locale="en-US">
                6/10/24
            </Time>
            <Br />• <Code>time-short</Code>:{' '}
            <Time unix={fixedTimestamp} format="time-short" locale="en-US">
                6:13 AM
            </Time>
            <Br />• <Code>weekday-date</Code>:{' '}
            <Time unix={fixedTimestamp} format="weekday-date" locale="en-US">
                Mon, Jun 10
            </Time>
            <Br count={2} />
            {/* 3. Ergonomic Boolean Flags */}
            <Bold>3. Semantic Boolean Flags:</Bold>
            <Br />
            • Weekday + Long Date: <Time date={now} weekday dateLong />
            <Br />
            • Long Time with Seconds: <Time date={now} timeLong />
            <Br count={2} />
            {/* 4. Timestamp Normalization */}
            <Bold>4. Automatic Unit Normalization:</Bold>
            <Br />• Milliseconds (<Code>{Date.now()}</Code>):{' '}
            <Time unix={Date.now()} format="time-short" />
            <Br />• Seconds (<Code>{Math.floor(Date.now() / 1000)}</Code>):{' '}
            <Time unix={Math.floor(Date.now() / 1000)} format="time-short" />
            <Br />• JavaScript Date object (<Code>new Date()</Code>):{' '}
            <Time date={now} format="date-short" />
            <Br count={2} />
            {/* 5. Custom Fallback Behavior */}
            <Blockquote expandable>
                <Bold>💡 Fallback Mechanism for Older Clients</Bold>
                <Br />
                Telegram clients older than v11.4 do not support interactive timestamps.
                <Br />
                The <Code>&lt;Time&gt;</Code> component automatically formats a fallback string
                according to your configured <Code>locale</Code>, or uses any custom fallback text
                passed as children:
                <Br />• Fallback: <Time unix={fixedTimestamp}>[Event on June 10, 2024]</Time>
            </Blockquote>
        </>
    );
};

/**
 * Serializes DatesPage into Telegram Bot API compliant HTML string.
 */
export const renderDatesPage = (): string => {
    return renderToString(<DatesPage />);
};

export default DatesPage;
