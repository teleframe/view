/**
 * @fileoverview Live animated progress task screen view
 * @module examples/src/pages/live-progress
 */

import {
    Bold,
    Br,
    Code,
    Italic,
    P,
    Paragraph,
    ProgressBar,
    renderToString,
} from '@telegram-markup/native';
import type { LiveProgressPageProps } from './types';

/**
 * Live Progress Task display component showcasing active message editing
 */
export const LiveProgressPage = ({
    progress = 50,
    stage = 'Optimizing assets...',
    status = 'running',
    elapsedSeconds = 5,
}: Partial<LiveProgressPageProps> = {}) => {
    const statusLabel =
        status === 'running'
            ? '⏳ Running Background Task...'
            : status === 'completed'
              ? '🎉 Task Completed Successfully!'
              : '🛑 Task Cancelled';

    return (
        <>
            {/* Title */}
            <Paragraph>
                <Bold>🚀 Live Animated Progress Demonstration</Bold>
            </Paragraph>

            {/* Task status indicator */}
            <P>
                <Bold>Status:</Bold> {statusLabel}
                <Br />
                <Bold>Current Step:</Bold> <Code>{stage}</Code>
                <Br />
                <Bold>Elapsed Time:</Bold> {elapsedSeconds}s
            </P>

            {/* Primary Block Progress Bar */}
            <Bold>System Deployment Progress:</Bold>
            <Br />
            <ProgressBar value={progress} total={100} style="blocks" showPercent showValue mono />
            <Br count={2} />

            {/* Secondary Emoji Style Bar */}
            <Bold>Visual Status:</Bold>
            <Br />
            <ProgressBar value={progress} total={100} style="emoji" length={10} />
            <Br count={2} />

            {/* Technical Notice */}
            <Italic>
                ⚡ Notice: This message is updating live in-place via Telegram Bot API
                `editMessageText` every second without triggering chat notification sounds.
            </Italic>
        </>
    );
};

/**
 * Serializes LiveProgressPage into Telegram Bot API compliant HTML string
 */
export const renderLiveProgressPage = (props?: Partial<LiveProgressPageProps>): string => {
    return renderToString(<LiveProgressPage {...props} />);
};

export default LiveProgressPage;
