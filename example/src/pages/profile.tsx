/**
 * @fileoverview Realistic User Profile showcase screen demonstrating comprehensive Native markup
 * @module examples/src/pages/profile
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    Each,
    Italic,
    Li,
    Link,
    P,
    Paragraph,
    ProgressBar,
    Show,
    Time,
    Ul,
    renderToString,
} from '@telegram-markup/native';
import type { ProfilePageProps } from './types';

/**
 * Realistic user profile page showcasing typography, lists, progress bars, and dates
 */
export const ProfilePage = ({
    userId = 123456789,
    firstName = 'Telegram User',
    username,
    isVip = true,
    joinedAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
}: Partial<ProfilePageProps> = {}) => {
    const badges = ['TypeScript', 'Bun', 'grammY', 'JSX Native'];

    return (
        <>
            {/* Header */}
            <Paragraph>
                <Bold>👤 USER PROFILE CARD</Bold>
            </Paragraph>

            {/* Identity block */}
            <P>
                <Bold>Name:</Bold> {firstName} (<Link userId={userId}>open chat</Link>)
                <Br />
                <Bold>Username:</Bold> {username ? `@${username}` : <i>none</i>}
                <Br />
                <Bold>Telegram ID:</Bold> <Code>{userId}</Code>
                <Br />
                <Bold>Tier:</Bold>{' '}
                <Show when={isVip} fallback={<i>🌱 Standard Community Member</i>}>
                    <b>🌟 VIP Pro Subscriber</b>
                </Show>
            </P>

            {/* Bio quote */}
            <Blockquote>
                "Building fast, declarative, componentized Telegram bots with JSX and Bun."
            </Blockquote>
            <Br count={2} />

            {/* Registration Time */}
            <P>
                <Bold>Member Since:</Bold> <Time date={joinedAt} format="date-long" /> (
                <Time date={joinedAt} relative />)
            </P>

            {/* Activity Summary List */}
            <Bold>📊 Activity Summary</Bold>
            <Br />
            <Ul bullet="dash">
                <Li>
                    <Bold>Messages:</Bold> 1,420 (Top 5%)
                </Li>
                <Li>
                    <Bold>Karma:</Bold> +89 (High)
                </Li>
                <Li>
                    <Bold>Streak:</Bold> 14 days (Active)
                </Li>
            </Ul>
            <Br />

            {/* Cloud Storage Quota Progress Bar */}
            <Bold>💾 Cloud Storage Quota (7.5 / 10 GB)</Bold>
            <Br />
            <ProgressBar value={75} total={100} style="bar" showPercent mono />
            <Br count={2} />

            {/* Badges / Skills list via Each */}
            <Bold>🏷️ Skill Badges</Bold>
            <Br />
            <Each items={badges} separator=" • ">
                {(badge: string) => <Code>{badge}</Code>}
            </Each>
            <Br count={2} />

            {/* Live sync note */}
            <Italic>🔄 Profile data synchronized with Telegram Bot API in real time.</Italic>
        </>
    );
};

/**
 * Serializes ProfilePage into Telegram Bot API compliant message
 */
export const renderProfilePage = (props?: Partial<ProfilePageProps>): string => {
    return renderToString(<ProfilePage {...props} />);
};

export default ProfilePage;
