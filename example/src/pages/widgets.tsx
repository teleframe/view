/**
 * @fileoverview Visual progress bars and control widgets showcase page
 * @module examples/native/src/pages/widgets
 */

import { Bold, Br, Divider, Italic, ProgressBar, Show, render } from '@telegram-markup/native';

/**
 * Progress widgets demonstration component.
 * Demonstrates visual progress bars, dividers, and declarative conditional rendering.
 */
export const WidgetsPage = () => {
    // Dynamic system metric values
    const diskUsage = 73;
    const isServerOnline = true;

    return (
        <>
            {/* Title */}
            <Bold>📊 Visual Progress &amp; Control Widgets</Bold>
            <Br />
            <Italic>Native visual components designed for Telegram messages</Italic>
            <Divider char="─" length={26} />
            {/* 1. Progress Bars */}
            <Bold>1. Visual Progress Bars (ProgressBar):</Bold>
            <Br />
            Colored Emoji Preset:
            <Br />
            <ProgressBar value={7} total={10} style="emoji" showPercent showValue />
            <Br count={2} />
            Smooth Fill Bar:
            <Br />
            <ProgressBar value={diskUsage} total={100} size={15} style="bar" showPercent />
            <Br count={2} />
            Classic Block Characters with Prefix &amp; Suffix:
            <Br />
            <ProgressBar
                value={85}
                total={100}
                style="blocks"
                prefix="CPU: "
                suffix=" OK"
                mono
                showPercent
            />
            <Br count={2} />
            Circle Dots Preset:
            <Br />
            <ProgressBar value={6} total={10} style="circle" showPercent />
            <Br count={2} />
            Slider Control with Thumb:
            <Br />
            <ProgressBar value={60} style="slider" size={12} />
            <Br />
            <Divider char="─" length={26} />
            {/* 2. Declarative Conditional Rendering (<Show>) */}
            <Bold>2. Declarative Conditional Rendering (Show):</Bold>
            <Br />
            <Show
                when={isServerOnline}
                fallback={<Italic>🔴 Server is currently undergoing maintenance</Italic>}
            >
                <Bold>🟢 All cluster nodes are operating normally</Bold>
            </Show>
        </>
    );
};

/**
 * Serializes WidgetsPage into Telegram Bot API compliant message.
 */
export const renderWidgetsPage = () => {
    return render(<WidgetsPage />);
};

export default WidgetsPage;
