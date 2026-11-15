/**
 * @fileoverview Topic hub welcome screen component
 * @module examples/src/pages/topics-hub
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    Italic,
    Link,
    P,
    Paragraph,
    renderToString,
} from '@teleframe/view/native';
import type { TopicHubPageProps } from './types';

/**
 * Renders introductory banner and command navigation for a forum topic
 */
export const TopicHubPage = ({
    category = 'native',
    topicName = 'General',
    description = 'Topic overview',
}: Partial<TopicHubPageProps> = {}) => {
    return (
        <>
            {/* Topic Title */}
            <Paragraph>
                <Bold>{topicName}</Bold>
            </Paragraph>

            {/* Description */}
            <Blockquote>{description}</Blockquote>
            <Br count={2} />

            {/* Topic Specific Guidance */}
            {category === 'native' ? (
                <P>
                    <Bold>✨ All native components are active in this topic!</Bold>
                    <Br />
                    Use the inline keyboard below to explore interactive screens, typography,
                    progress bars, and user profiles.
                </P>
            ) : (
                <P>
                    <Bold>🚧 Preview Topic</Bold>
                    <Br />
                    This topic is reserved for <Code>@teleframe/view/{category}</Code>.
                    <Br />
                    All components and interactive examples will be automatically routed here once
                    the package is loaded.
                </P>
            )}

            {/* Documentation Link */}
            <Link href="https://github.com/teleframe/view">
                View source and documentation on GitHub
            </Link>
            <Br count={2} />

            <Italic>🤖 Managed by Telegram Markup Example Engine</Italic>
        </>
    );
};

/**
 * Serializes TopicHubPage into Telegram Bot API compliant HTML string
 */
export const renderTopicHubPage = (props?: Partial<TopicHubPageProps>): string => {
    return renderToString(<TopicHubPage {...props} />);
};

export default TopicHubPage;
