/**
 * @fileoverview Start / Home page demonstrating basic markup, user mentions, and blockquotes
 * @module example/src/pages/start
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    Link,
    P,
    Paragraph,
    Show,
    User,
    renderToString,
} from '@telegram-markup/native';
import type { StartPageProps } from './types';

/**
 * Start / Welcome page component.
 * Introduces the user to the bot and demonstrates inline user mentions,
 * forum topic support, and in-place screen navigation.
 */
export const StartPage = ({
    userId = 123456789,
    firstName = 'Explorer',
    isForum = false,
}: Partial<StartPageProps> = {}) => {
    return (
        <>
            {/* Header title */}
            <Paragraph>
                <Bold>🚀 Welcome to Telegram Markup!</Bold>
            </Paragraph>

            {/* Personalized greeting & creator links */}
            <P>
                Hello, <User id={userId}>{firstName}</User>!
                <Br />
                Author &amp; Maintainer: <Link href="https://github.com/naylour">Naylour</Link>{' '}
                (Telegram: <Link href="https://t.me/naylour">@naylour</Link>).
            </P>

            {/* Core philosophy quote */}
            <Blockquote expandable>
                <Bold>💡 Concept: «A Message is a Page»</Bold>
                <Br />
                Telegram Markup brings the declarative power of modern web development (JSX/TSX)
                directly into Telegram Bot API. Instead of concatenating raw strings or fighting
                fragile Markdown parsing, you build reactive screens with component architecture,
                strict type safety, and automatic escaping.
            </Blockquote>
            <Br count={2} />

            {/* Forum Topics Notice if in a forum supergroup */}
            <Show when={isForum}>
                <Blockquote>
                    <Bold>🧵 Forum Supergroup Active</Bold>
                    <Br />
                    This chat uses Telegram Topics. The bot automatically manages and publishes
                    screens in dedicated threads: <Code>Native Components</Code>,{' '}
                    <Code>Rich Text</Code>, <Code>Interactive Widgets</Code>, and{' '}
                    <Code>Telegraph Articles</Code>.
                </Blockquote>
                <Br count={2} />
            </Show>

            {/* Technology stack & navigation prompt */}
            <P>
                Stack: <Link href="https://bun.sh">Bun</Link> +{' '}
                <Link href="https://grammy.dev">grammY</Link> + <Code>JSX / TSX</Code> +{' '}
                <Code>Zero-JSX Functional API</Code>.
                <Br />
                Select a category below to explore the native markup engine:
            </P>
        </>
    );
};

/**
 * Serializes the StartPage component into Telegram Bot API compliant HTML string.
 */
export const renderStartPage = (props?: Partial<StartPageProps>): string => {
    return renderToString(<StartPage {...props} />);
};

export default StartPage;
