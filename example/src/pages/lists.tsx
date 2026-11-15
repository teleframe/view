/**
 * @fileoverview Lists and collection mapping showcase page
 * @module examples/native/src/pages/lists
 */

import {
    Bold,
    Br,
    Divider,
    Each,
    Italic,
    Li,
    Ol,
    Ul,
    renderToString,
} from '@teleframe/view/native';

/**
 * Lists demonstration component.
 * Demonstrates unordered bullet/dash lists, ordered numeric lists with styles,
 * Roman numerals, and high-DX collection mapping using `<Each>`.
 */
export const ListsPage = () => {
    // Sample primitive collection for bullet list demonstration
    const fruits: readonly string[] = ['Green Apple 🍏', 'Cavendish Banana 🍌', 'Sweet Mango 🥭'];

    // Sample complex objects for numbered sequential workflow
    const steps = [
        { title: 'Define UI structure in declarative TSX', duration: '1 min' },
        { title: 'Compile bundle and emit declaration files', duration: '1.3 sec' },
        { title: 'Deliver sanitized HTML to Telegram API', duration: 'Instant' },
    ];

    // Inline tags for custom separator demonstration
    const tags: readonly string[] = ['telegram', 'markup', 'typescript', 'bun'];

    // Empty array demonstrating fallback rendering
    const emptyCart: readonly string[] = [];

    return (
        <>
            {/* Title & Subtitle */}
            <Bold>📋 Lists &amp; Collection Mapping (Lists &amp; Each)</Bold>
            <Br />
            <Italic>Declarative list formatting with automated line-break handling</Italic>
            <Divider char="─" length={26} />

            {/* 1. Unordered Dash List */}
            <Bold>1. Unordered List with Dash Bullet (Ul &amp; Li):</Bold>
            <Br />
            <Ul bullet="dash">
                <Li>Primary infrastructure feature</Li>
                <Li>Secondary optimization item</Li>
                <Li marker="⭐ ">Special highlighted item with custom marker</Li>
            </Ul>

            {/* 2. Ordered Numbered List with Parenthesis */}
            <Bold>2. Ordered Numbered List (Ol paren):</Bold>
            <Br />
            <Ol start={1} numberStyle="paren">
                <Li>Project initialization</Li>
                <Li>Component composition</Li>
                <Li>Production deployment</Li>
            </Ol>

            {/* 3. Ordered List with Roman Numerals */}
            <Bold>3. Roman Numerals (Ol roman):</Bold>
            <Br />
            <Ol start={1} numberStyle="roman">
                <Li>Architecture &amp; Data Modeling</Li>
                <Li>HTML Tree Serialization</Li>
            </Ol>

            <Divider char="─" length={26} />

            {/* 4. Collection Mapping: Unordered List */}
            <Bold>4. Collection Mapping (Each as=&quot;ul&quot;):</Bold>
            <Br />
            <Each items={fruits} as="ul" marker="•">
                {(fruit: string) => fruit}
            </Each>

            {/* 5. Collection Mapping: Ordered List with Typed Item Callback */}
            <Bold>5. Collection Mapping (Each as=&quot;ol&quot;):</Bold>
            <Br />
            <Each items={steps} as="ol" start={1}>
                {(step: (typeof steps)[number]) => (
                    <>
                        <Bold>{step.title}</Bold> — <Italic>{step.duration}</Italic>
                    </>
                )}
            </Each>

            {/* 6. Inline Delimiter Collection */}
            <Bold>6. Inline Hashtags (Each with separator):</Bold>
            <Br />
            <Each items={tags} separator=" • ">
                {(tag: string) => `#${tag}`}
            </Each>
            <Br count={2} />

            {/* 7. Empty Collection with Fallback */}
            <Bold>7. Empty State Fallback Handling:</Bold>
            <Br />
            <Each items={emptyCart} fallback={<Italic>⚠️ Your cart is currently empty</Italic>}>
                {(item: string) => item}
            </Each>
            <Br count={2} />

            {/* 8. Nested Indentation & Multiline Alignment */}
            <Bold>8. Nested Indentation (Li.indent &amp; List.indentMultiline):</Bold>
            <Br />
            <Ul indentMultiline>
                <Li indent={0}>Root category A</Li>
                <Li indent={1}>Sub-item A.1 with child hierarchy</Li>
                <Li indent={2}>Deeply nested leaf node A.1.a</Li>
                <Li indent={0}>
                    Multiline entry with automated indentation:
                    <Br />
                    Subsequent lines preserve clean margin alignment
                </Li>
            </Ul>
        </>
    );
};

/**
 * Serializes ListsPage into Telegram Bot API compliant HTML string.
 *
 * @returns {string} Sanitized HTML string ready for parse_mode: 'HTML'
 */
export const renderListsPage = (): string => {
    return renderToString(<ListsPage />);
};

export default ListsPage;
