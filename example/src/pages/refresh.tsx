/**
 * @fileoverview Live refresh demonstration page
 * @module examples/native/src/pages/refresh
 */

import { Bold, Br, Code, renderToString } from '@telegram-markup/native';

/**
 * Properties for the RefreshPage component.
 */
export interface RefreshPageProps {
    /** Indicates whether the bot is running in Telegram test environment */
    isTestEnv: boolean;
}

/**
 * Screen refresh demonstration component.
 * Displays live timestamp and current operating environment,
 * demonstrating seamless in-place message editing via Telegram Bot API.
 */
export const RefreshPage = ({ isTestEnv = false }: Partial<RefreshPageProps> = {}) => {
    // Capture current ISO time formatted to UTC locale
    const now = new Date().toUTCString();

    return (
        <>
            {/* Header */}
            <Bold>🔄 Screen Refreshed Live!</Bold>
            <Br count={2} />
            {/* Timestamp */}
            Last Updated At: <Code>{now}</Code>
            <Br />
            {/* Runtime Environment Info */}
            Target Environment:{' '}
            <Code>{isTestEnv ? 'Telegram Test Environment' : 'Production'}</Code>
            <Br count={2} />
            Notice how the message text updated in-place without triggering new push notifications.
        </>
    );
};

/**
 * Serializes RefreshPage into Telegram Bot API compliant HTML string.
 *
 * @param props - Environment configuration
 * @returns {string} Sanitized HTML string ready for parse_mode: 'HTML'
 */
export const renderRefreshPage = (props?: Partial<RefreshPageProps>): string => {
    return renderToString(<RefreshPage {...props} />);
};

export default RefreshPage;
