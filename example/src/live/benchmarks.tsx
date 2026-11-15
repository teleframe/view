/**
 * @fileoverview Benchmarks executed as part of the live test pipeline
 * @module example/live/benchmarks
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
    ProgressBar,
    Strike,
    Time,
    Ul,
    Underline,
    User,
    render,
    renderToString,
} from '@teleframe/view/native';
import { TARGET_CHAT_ID } from './runner';
import type { BenchmarkResult } from './types';

export const benchmarkResults: BenchmarkResult[] = [];

function runBenchmark(name: string, iterations: number, fn: () => void): BenchmarkResult {
    for (let i = 0; i < Math.min(iterations / 10, 500); i++) {
        fn();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();
    const durationMs = end - start;
    const opsPerSec = Math.round(iterations / (durationMs / 1000));
    const avgMicroseconds = Number(((durationMs * 1000) / iterations).toFixed(2));

    const result = { name, iterations, durationMs, opsPerSec, avgMicroseconds };
    benchmarkResults.push(result);
    console.log(
        `⏱ ${name.padEnd(46)} | ${opsPerSec.toLocaleString().padStart(9)} ops/s | ${avgMicroseconds.toFixed(2).padStart(7)} μs/op`,
    );
    return result;
}

export function runBenchmarks(): void {
    console.log('\n🚀 Starting Performance & Scalability Benchmarks...');
    console.log('================================================================================');

    const simpleJsx = (
        <Paragraph>
            <Bold>System Status:</Bold> All services <Italic>operational</Italic>.{' '}
            <Code>OK 200</Code>
        </Paragraph>
    );
    runBenchmark('1. Simple Message — renderToString() [HTML]', 10000, () => {
        renderToString(simpleJsx);
    });
    runBenchmark('1. Simple Message — render() [Entities]', 10000, () => {
        render(simpleJsx);
    });

    const complexJsx = (
        <Paragraph>
            <Bold>🚀 Deployment Notification</Bold>
            <br />
            Target: <Link href="https://example.com/deploy">Production Cluster EU-1</Link>
            <Blockquote expandable>
                <Bold>Execution Log:</Bold>
                <Ul>
                    <Li marker="✓ ">Docker image built &amp; signed</Li>
                    <Li marker="✓ ">Database migrations completed in 1.4s</Li>
                    <Li marker="✓ ">Healthchecks verified (200 OK)</Li>
                </Ul>
                <Divider char="─" length={20} />
                <CodeBlock language="typescript">{`const status = await cluster.verify();`}</CodeBlock>
            </Blockquote>
            <Time unix={1718000000} format="wdt">
                Monday, June 10, 2024
            </Time>
            <br />
            <User id={TARGET_CHAT_ID}>Шахриёр (Release Lead)</User>
            <br />
            <ProgressBar value={8} total={10} length={10} showPercent />
        </Paragraph>
    );
    runBenchmark('2. Real-world Rich Message — renderToString()', 5000, () => {
        renderToString(complexJsx);
    });
    runBenchmark('2. Real-world Rich Message — render() [Entities]', 5000, () => {
        render(complexJsx);
    });

    const depths = [1, 2, 4, 8, 16, 24, 32];
    for (const d of depths) {
        let tree: any = 'Leaf Text Content';
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
        runBenchmark(`Depth ${d.toString().padStart(2)} levels — renderToString()`, 2000, () => {
            renderToString(tree);
        });
        runBenchmark(`Depth ${d.toString().padStart(2)} levels — render() [Entities]`, 2000, () => {
            render(tree);
        });
    }

    const chunkCount = 40;
    const items = Array.from({ length: chunkCount }, (_, idx) => (
        <Li key={idx} marker="• ">
            Item <Bold>#{idx}</Bold>: <Code>{`id_${idx * 1024}`}</Code> status <Italic>OK</Italic>
        </Li>
    ));
    const maxPayloadTree = (
        <Blockquote>
            <Bold>📦 High-Density Message Structure (Bulk Entities)</Bold>
            <Ul>{items}</Ul>
        </Blockquote>
    );
    runBenchmark('4. High-Density Bulk Payload — renderToString()', 1000, () => {
        renderToString(maxPayloadTree);
    });
    runBenchmark('4. High-Density Bulk Payload — render() [Entities]', 1000, () => {
        render(maxPayloadTree);
    });

    runBenchmark('5. Validation Overhead — renderToString() (NO validate)', 5000, () => {
        renderToString(complexJsx);
    });
    runBenchmark('5. Validation Overhead — renderToString() (WITH validate)', 5000, () => {
        renderToString(complexJsx, { validate: 'message' });
    });

    console.log(
        '================================================================================\n',
    );
}
