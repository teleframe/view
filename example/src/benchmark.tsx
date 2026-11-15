/**
 * @fileoverview Pure Local High-Precision Benchmark Suite for @telegram-markup/native
 * Runs reproducible multi-round performance measurements across:
 * 1. Flat Messages (disjoint entities)
 * 2. Nested Messages (cascading hierarchies & identical boundaries)
 * 3. Boundary Messages (exact 4096 message, 1024 caption, surrogate pairs, RawHtml)
 * 4. Validation Overhead Analysis (validate: 'message' / 'caption')
 * Computes median, min, max, and ops/sec across 5 rounds per scenario.
 */

import {
    Blockquote,
    Bold,
    Code,
    CodeBlock,
    Divider,
    Each,
    Emoji,
    Italic,
    Li,
    Link,
    Paragraph,
    Pre,
    ProgressBar,
    RawHtml,
    Show,
    Spoiler,
    Strike,
    TELEGRAM_LIMITS,
    Time,
    Ul,
    Underline,
    User,
    compileToEntities,
    render,
    renderToString,
    stripTelegramHtml,
} from '@telegram-markup/native';

interface BenchmarkRound {
    opsPerSec: number;
    avgMicroseconds: number;
}

interface BenchmarkReport {
    category: string;
    name: string;
    mode: 'HTML' | 'ENTITIES';
    medianOps: number;
    medianMicros: number;
    minMicros: number;
    maxMicros: number;
}

const reports: BenchmarkReport[] = [];

function measureScenario(
    category: string,
    name: string,
    mode: 'HTML' | 'ENTITIES',
    iterations: number,
    roundsCount: number,
    fn: () => void,
): BenchmarkReport {
    // 1. Warmup round to allow JIT optimization
    const warmupCount = Math.min(Math.floor(iterations / 4), 1000);
    for (let i = 0; i < warmupCount; i++) {
        fn();
    }

    // 2. Execute multiple independent measurement rounds
    const rounds: BenchmarkRound[] = [];
    for (let r = 0; r < roundsCount; r++) {
        const start = performance.now();
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        const end = performance.now();
        const durationMs = end - start;
        const opsPerSec = Math.round(iterations / (durationMs / 1000));
        const avgMicroseconds = Number(((durationMs * 1000) / iterations).toFixed(2));
        rounds.push({ opsPerSec, avgMicroseconds });
    }

    // 3. Calculate statistics (median, min, max)
    rounds.sort((a, b) => a.avgMicroseconds - b.avgMicroseconds);
    const medianRound = rounds[Math.floor(rounds.length / 2)];
    const minMicros = rounds[0].avgMicroseconds;
    const maxMicros = rounds[rounds.length - 1].avgMicroseconds;

    const report: BenchmarkReport = {
        category,
        name,
        mode,
        medianOps: medianRound.opsPerSec,
        medianMicros: medianRound.avgMicroseconds,
        minMicros,
        maxMicros,
    };
    reports.push(report);

    const modeStr = mode.padEnd(8);
    const opsStr = `${report.medianOps.toLocaleString()} ops/s`.padStart(15);
    const latencyStr =
        `${report.medianMicros.toFixed(2)} μs/op (min: ${minMicros.toFixed(2)}, max: ${maxMicros.toFixed(2)})`.padStart(
            32,
        );
    console.log(`  [${modeStr}] ${name.padEnd(42)} | ${opsStr} | ${latencyStr}`);

    return report;
}

function runBenchmarkSuite() {
    console.log(
        '\n================================================================================================',
    );
    console.log(
        '⚡ TELEGRAM MARKUP — REPRODUCIBLE MULTI-ROUND BENCHMARK SUITE (5 ROUNDS / MEDIAN)',
    );
    console.log(
        '================================================================================================',
    );

    // ------------------------------------------------------------------------
    // CATEGORY 1: ПЛОСКИЕ СООБЩЕНИЯ (Flat Messages / Disjoint Entities)
    // ------------------------------------------------------------------------
    console.log('\n📂 1. ПЛОСКИЕ СООБЩЕНИЯ (Flat Messages / Disjoint Entities):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    // 1.1 Simple Flat Message (1-2 entities)
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

    // 1.2 Medium Flat List (20 items = 40 disjoint entities)
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

    // 1.3 Dense Bulk Flat List (80 items = 160 disjoint entities)
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

    // ------------------------------------------------------------------------
    // CATEGORY 2: ВЛОЖЕННЫЕ СООБЩЕНИЯ (Nested Messages / Deep Chains)
    // ------------------------------------------------------------------------
    console.log('\n📂 2. ВЛОЖЕННЫЕ СООБЩЕНИЯ (Nested Messages / Deep Chains & Cascades):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    // 2.1 Depth Scaling: 1, 2, 4, 8, 16, 24, 32 levels of nesting
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

    // 2.2 Real-World Compound Dashboard Message (Nested Containers & Layout)
    const realWorldTree = (
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

    // 2.3 Identical Span Boundaries (Blockquote > Code, Pre, Time, User, Link)
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

    // ------------------------------------------------------------------------
    // CATEGORY 3: ГРАНИЧНЫЕ СООБЩЕНИЯ (Boundary Messages / Limits & Encodings)
    // ------------------------------------------------------------------------
    console.log('\n📂 3. ГРАНИЧНЫЕ СООБЩЕНИЯ (Boundary Messages / Limits & Encodings):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    // 3.1 Exact 4096 UTF-16 Code Units Message (with validate: 'message')
    const limitHeader = '📏 Exact 4096 UTF-16 Code Units Limit Message\n\n';
    const limitFooter = '\n\n[End of message: exactly 4096 characters]';
    const fillerLength =
        TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH - (limitHeader.length + limitFooter.length);
    const fillerText = '•'.repeat(fillerLength);
    const exact4096Tree = [
        <Bold>{limitHeader}</Bold>,
        <Blockquote expandable>
            <Italic>{fillerText}</Italic>
        </Blockquote>,
        <Bold>{limitFooter}</Bold>,
    ];
    measureScenario(
        'Boundary Messages',
        '3.1 Exact 4096 UTF-16 Limit Message',
        'HTML',
        1000,
        5,
        () => {
            renderToString(exact4096Tree, { validate: 'message' });
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.1 Exact 4096 UTF-16 Limit Message',
        'ENTITIES',
        1000,
        5,
        () => {
            render(exact4096Tree, { validate: 'message' });
        },
    );

    // 3.2 Exact 1024 UTF-16 Code Units Caption (with validate: 'caption')
    const captionHeader = '📷 Photo Caption: ';
    const captionFillerLength = TELEGRAM_LIMITS.CAPTION_MAX_LENGTH - captionHeader.length;
    const captionFiller = 'C'.repeat(captionFillerLength);
    const exact1024CaptionTree = [<Bold>{captionHeader}</Bold>, <Italic>{captionFiller}</Italic>];
    measureScenario(
        'Boundary Messages',
        '3.2 Exact 1024 UTF-16 Limit Caption',
        'HTML',
        2000,
        5,
        () => {
            renderToString(exact1024CaptionTree, { validate: 'caption' });
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.2 Exact 1024 UTF-16 Limit Caption',
        'ENTITIES',
        2000,
        5,
        () => {
            render(exact1024CaptionTree, { validate: 'caption' });
        },
    );

    // 3.3 Multibyte Unicode & Surrogate Pairs (UTF-16 offset indexing)
    const unicodeTree = (
        <Paragraph>
            🚀 <Bold>Rocket</Bold> 🌍 <Italic>Earth</Italic> ✨ <Underline>Sparkles</Underline> 🔥{' '}
            <Spoiler>Fire</Spoiler>
            <br />
            Complex family emoji (ZWJ): 👨‍👩‍👧‍👦 | Flag sequences: 🇺🇳 🇬🇧 🇯🇵
            <br />
            Math &amp; Multilingual scripts: ∫ f(x)dx = ∑ a_n · x^n | 東京 | Привет мир! | مرحبا
        </Paragraph>
    );
    measureScenario(
        'Boundary Messages',
        '3.3 Multibyte Unicode & Surrogate Pairs',
        'HTML',
        5000,
        5,
        () => {
            renderToString(unicodeTree);
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.3 Multibyte Unicode & Surrogate Pairs',
        'ENTITIES',
        5000,
        5,
        () => {
            render(unicodeTree);
        },
    );

    // 3.4 RawHtml with Numeric Character References (&#38;, &#x26;)
    const rawHtmlTree = (
        <Paragraph>
            <RawHtml html='<span class="tg-spoiler">Numerical entities: &#38; and &#x26;</span>' />
            <br />
            <Link href="https://example.com/search?q=telegram&amp;category=bots&amp;sort=asc">
                Escaped ampersands in query parameters
            </Link>
        </Paragraph>
    );
    measureScenario(
        'Boundary Messages',
        '3.4 RawHtml & Numerical References',
        'HTML',
        5000,
        5,
        () => {
            renderToString(rawHtmlTree);
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.4 RawHtml & Numerical References',
        'ENTITIES',
        5000,
        5,
        () => {
            render(rawHtmlTree);
        },
    );

    // ------------------------------------------------------------------------
    // CATEGORY 4: ОВЕРХЕД ВАЛИДАЦИИ (Validation Overhead Analysis)
    // ------------------------------------------------------------------------
    console.log('\n📂 4. ОВЕРХЕД ВАЛИДАЦИИ (Validation Overhead Analysis):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    measureScenario(
        'Validation Overhead',
        '4.1 Compound Dashboard (NO validate)',
        'HTML',
        5000,
        5,
        () => {
            renderToString(realWorldTree);
        },
    );
    measureScenario(
        'Validation Overhead',
        '4.1 Compound Dashboard (WITH validate)',
        'HTML',
        5000,
        5,
        () => {
            renderToString(realWorldTree, { validate: 'message' });
        },
    );
    measureScenario(
        'Validation Overhead',
        '4.2 Compound Dashboard (NO validate)',
        'ENTITIES',
        5000,
        5,
        () => {
            render(realWorldTree);
        },
    );
    measureScenario(
        'Validation Overhead',
        '4.2 Compound Dashboard (WITH validate)',
        'ENTITIES',
        5000,
        5,
        () => {
            render(realWorldTree, { validate: 'message' });
        },
    );

    console.log(
        '\n================================================================================================',
    );
    console.log('✨ BENCHMARK SUITE COMPLETED SUCCESSFULLY ACROSS ALL SCENARIOS!');
    console.log(
        '================================================================================================\n',
    );
}

runBenchmarkSuite();
