/**
 * @fileoverview Direct MessageEntity compilation pipeline demonstration page
 * @module examples/src/pages/entities
 */

import {
    Blockquote,
    Bold,
    Br,
    Code,
    CodeBlock,
    Divider,
    Each,
    Emoji,
    Fragment,
    Italic,
    Link,
    P,
    Paragraph,
    Spoiler,
    User,
    render,
    renderToString,
} from '@telegram-markup/native';

/**
 * Demonstrates the primary `render()` pipeline compiling JSX directly into
 * Telegram Bot API `{ text, entities }` data structure in a single pass.
 */
export const EntitiesPage = () => {
    // Sample subtree demonstrating various entity types and surrogate pairs
    const sampleTree = (
        <>
            <Bold>🚀 Rocket Launch</Bold> with <Italic>high velocity</Italic> and{' '}
            <Spoiler>top secret cargo</Spoiler>.
            <Br />
            Mention: <User id={987654321}>Commander</User> or visit{' '}
            <Link href="https://t.me/example">Mission Control</Link>.
        </>
    );

    const compiled = render(sampleTree);

    return (
        <>
            {/* Header */}
            <Paragraph>
                <Bold>🎯 Direct MessageEntity Compiler (render)</Bold>
            </Paragraph>

            <P>
                Unlike traditional HTML string formatters, <Code>render()</Code> compiles the JSX
                element tree directly into Telegram&apos;s native Bot API{' '}
                <Code>{'{ text, entities }'}</Code> object in a single pass.
            </P>

            <Divider char="─" length={28} />

            {/* 1. Compiled Plain Text */}
            <Bold>1. Stripped Plain Text Output:</Bold>
            <Br />
            <Code>{compiled.text}</Code>
            <Br count={2} />

            {/* 2. Compiled Entities Breakdown */}
            <Bold>2. Generated Bot API Entities ({compiled.entities.length}):</Bold>
            <Br />
            <Each items={compiled.entities}>
                {(ent: (typeof compiled.entities)[number]) => (
                    <>
                        • <Code>{ent.type}</Code>: offset <Code>{ent.offset}</Code>, length{' '}
                        <Code>{ent.length}</Code>
                        <Br />
                    </>
                )}
            </Each>
            <Br />

            {/* 3. UTF-16 Code Units Precision */}
            <Blockquote expandable>
                <Bold>📐 UTF-16 Code Units Precision</Bold>
                <Br />
                Telegram requires all entity offsets and lengths to be calculated in UTF-16 code
                units.
                <Br />
                Surrogate pair characters like rocket <Code>🚀</Code> (length 2) or technologist{' '}
                <Code>👨‍💻</Code> (length 5) are accurately accounted for, ensuring zero entity shift
                errors on Telegram servers.
            </Blockquote>
            <Br count={2} />

            {/* 4. Sending with grammY */}
            <Bold>3. Clean grammY Delivery (No parse_mode needed):</Bold>
            <CodeBlock language="typescript">
                {`const { text, entities } = render(myScreen);

// Zero parsing overhead, immune to escaping bugs:
await ctx.reply(text, { entities });`}
            </CodeBlock>
        </>
    );
};

/**
 * Returns rendered EntitiesPage as HTML string for default menu preview.
 */
export const renderEntitiesPage = (): string => {
    return renderToString(<EntitiesPage />);
};

export default EntitiesPage;
