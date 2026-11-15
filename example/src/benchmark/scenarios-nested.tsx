/**
 * @fileoverview Nested benchmark scenario trees
 * @module example/benchmark/scenarios-nested
 */

import {
    Blockquote,
    Bold,
    Code,
    CodeBlock,
    Divider,
    Italic,
    Li,
    Link,
    Paragraph,
    Pre,
    ProgressBar,
    Strike,
    Time,
    Ul,
    Underline,
    User,
    render,
    renderToString,
} from '@teleframe/view/native';
import { measureScenario } from './runner';

export const realWorldTree = (
    <Paragraph>
        <Bold>🚀 Production Cluster Status</Bold>
        <br />
        Cluster: <Link href="https://example.com/cluster">EU-Central-1</Link>
        <Blockquote expandable>
            <Bold>Service Checks:</Bold>
            <Ul>
                <Li marker="✓ ">
                    API Gateway: <Code>active</Code>
                </Li>
                <Li marker="✓ ">
                    Auth Service: <Code>active</Code>
                </Li>
                <Li marker="✓ ">
                    Database Cluster: <Code>synced</Code>
                </Li>
            </Ul>
            <Divider char="─" length={22} />
            <CodeBlock language="typescript">{`const clusterHealth = await cluster.getHealth();`}</CodeBlock>
        </Blockquote>
        <Time unix={1718000000} format="wdt">
            Monday, June 10, 2024
        </Time>
        <br />
        <User id={2202303388}>Шахриёр (Lead SRE)</User>
        <br />
        <ProgressBar value={95} total={100} length={12} showPercent />
    </Paragraph>
);

export function runNestedScenarios(): void {
    console.log('\n📂 2. ВЛОЖЕННЫЕ СООБЩЕНИЯ (Nested Messages / Deep Chains & Cascades):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    const depths = [1, 2, 4, 8, 16, 24, 32];
    for (const d of depths) {
        let tree: any = 'Leaf Nested Text';
        for (let level = 0; level < d; level++) {
            const Tag =
                level % 4 === 0
                    ? Bold
                    : level % 4 === 1
                      ? Italic
                      : level % 4 === 2
                        ? Underline
                        : Strike;
            tree = Tag(tree);
        }
        measureScenario(
            'Nested Chains',
            `2.1 Depth Chain ${d.toString().padStart(2)} levels`,
            'HTML',
            3000,
            5,
            () => {
                renderToString(tree);
            },
        );
        measureScenario(
            'Nested Chains',
            `2.1 Depth Chain ${d.toString().padStart(2)} levels`,
            'ENTITIES',
            3000,
            5,
            () => {
                render(tree);
            },
        );
    }

    measureScenario('Nested Messages', '2.2 Real-World Compound Dashboard', 'HTML', 5000, 5, () => {
        renderToString(realWorldTree);
    });
    measureScenario(
        'Nested Messages',
        '2.2 Real-World Compound Dashboard',
        'ENTITIES',
        5000,
        5,
        () => {
            render(realWorldTree);
        },
    );

    const identicalSpanTree = (
        <Paragraph>
            <Blockquote>
                <Code>const identicalSpan = true;</Code>
            </Blockquote>
            <Blockquote>
                <Pre language="json">{`{ "nested": true }`}</Pre>
            </Blockquote>
            <Blockquote>
                <Time unix={1718000000} format="r">
                    in 2 days
                </Time>
            </Blockquote>
            <Blockquote>
                <User id={2202303388}>Шахриёр</User>
            </Blockquote>
            <Link href="https://example.com">
                <Bold>Bold Link</Bold>
            </Link>
        </Paragraph>
    );
    measureScenario(
        'Nested Messages',
        '2.3 Identical Span Boundaries (5 pairs)',
        'HTML',
        5000,
        5,
        () => {
            renderToString(identicalSpanTree);
        },
    );
    measureScenario(
        'Nested Messages',
        '2.3 Identical Span Boundaries (5 pairs)',
        'ENTITIES',
        5000,
        5,
        () => {
            render(identicalSpanTree);
        },
    );
}
