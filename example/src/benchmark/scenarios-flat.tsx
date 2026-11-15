/**
 * @fileoverview Flat and nested benchmark scenario trees
 * @module example/benchmark/scenarios-flat
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

export function runFlatScenarios() {
    console.log('\n📂 1. ПЛОСКИЕ СООБЩЕНИЯ (Flat Messages / Disjoint Entities):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    const simpleFlatTree = (
        <Paragraph>
            <Bold>Status:</Bold> Server is <Italic>healthy</Italic> and responding{' '}
            <Code>200 OK</Code>.
        </Paragraph>
    );
    measureScenario(
        'Flat Messages',
        '1.1 Simple Flat (3 disjoint entities)',
        'HTML',
        10000,
        5,
        () => {
            renderToString(simpleFlatTree);
        },
    );
    measureScenario(
        'Flat Messages',
        '1.1 Simple Flat (3 disjoint entities)',
        'ENTITIES',
        10000,
        5,
        () => {
            render(simpleFlatTree);
        },
    );

    const mediumFlatItems = Array.from({ length: 20 }, (_, idx) => (
        <Li key={idx} marker="• ">
            Node <Bold>#{idx}</Bold>: latency <Code>{`${idx * 2 + 5}ms`}</Code> (
            <Italic>nominal</Italic>)
        </Li>
    ));
    const mediumFlatTree = <Ul>{mediumFlatItems}</Ul>;
    measureScenario(
        'Flat Messages',
        '1.2 Medium Flat List (40 disjoint entities)',
        'HTML',
        5000,
        5,
        () => {
            renderToString(mediumFlatTree);
        },
    );
    measureScenario(
        'Flat Messages',
        '1.2 Medium Flat List (40 disjoint entities)',
        'ENTITIES',
        5000,
        5,
        () => {
            render(mediumFlatTree);
        },
    );

    const denseFlatItems = Array.from({ length: 80 }, (_, idx) => (
        <Li key={idx} marker="• ">
            Task <Bold>#{idx}</Bold>: key <Code>{`k_${idx}`}</Code>
        </Li>
    ));
    const denseFlatTree = <Ul>{denseFlatItems}</Ul>;
    measureScenario(
        'Flat Messages',
        '1.3 Dense Bulk Flat List (160 entities)',
        'HTML',
        2000,
        5,
        () => {
            renderToString(denseFlatTree);
        },
    );
    measureScenario(
        'Flat Messages',
        '1.3 Dense Bulk Flat List (160 entities)',
        'ENTITIES',
        2000,
        5,
        () => {
            render(denseFlatTree);
        },
    );
}

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

export function runNestedScenarios() {
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
