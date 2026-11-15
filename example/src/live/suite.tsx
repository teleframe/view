/**
 * @fileoverview Live Telegram Bot API verification and report transmission
 * @module example/live/suite
 */

import { benchmarkResults } from './benchmarks';
import { exceptionResults } from './exceptions';
import { TARGET_CHAT_ID, liveReports, sendEntitiesLive, sendHtmlLive } from './runner';
import {
    createExactLimitMessage,
    createExactSpanEntities,
    createExactSpanHtml,
    createRawHtmlEntitiesTest,
    createSevenLayerCascade,
    createSuiteIntro,
    createUnicodeSurrogateTest,
} from './suite-cases';
import { createFinalReport } from './suite-report';

export async function runLiveTelegramSuite(): Promise<void> {
    console.log(`\n📡 Executing Live Telegram Bot API Suite -> Target Chat: ${TARGET_CHAT_ID}`);
    console.log('========================================================================\n');

    await sendHtmlLive('1. Suite Initiation & Architecture Intro', createSuiteIntro());
    await sendHtmlLive('2. Exact Span Boundaries (HTML)', createExactSpanHtml(TARGET_CHAT_ID));
    await sendEntitiesLive(
        '3. Exact Span Boundaries (Entities render() Mode)',
        createExactSpanEntities(TARGET_CHAT_ID),
    );

    const sevenLayerCascade = createSevenLayerCascade();
    await sendHtmlLive('4. Deepest Permitted 7-Layer Formatting Cascade (HTML)', sevenLayerCascade);
    await sendEntitiesLive(
        '5. Deepest Permitted 7-Layer Formatting Cascade (Entities)',
        sevenLayerCascade,
    );

    const exactLimitJsx = createExactLimitMessage();
    await sendHtmlLive('6. Exact 4096 Characters Limit Boundary (HTML)', exactLimitJsx, 'message');
    await sendEntitiesLive(
        '7. Exact 4096 Characters Limit Boundary (Entities)',
        exactLimitJsx,
        'message',
    );

    await sendEntitiesLive(
        '8. Multibyte Unicode, Emoji ZWJ & Surrogate Pairs (Entities)',
        createUnicodeSurrogateTest(),
    );
    await sendHtmlLive(
        '9. RawHtml with Numerical Entities & Complex Query Params (HTML)',
        createRawHtmlEntitiesTest(),
    );

    const passedExceptions = exceptionResults.filter((r) => r.passed).length;
    const totalExceptions = exceptionResults.length;
    const passedLive = liveReports.filter((r) => r.success).length;
    const totalLive = liveReports.length;

    const benchmarks = {
        simpleHtml: benchmarkResults.find((b) =>
            b.name.startsWith('1. Simple Message — renderToString'),
        ),
        simpleEntities: benchmarkResults.find((b) =>
            b.name.startsWith('1. Simple Message — render()'),
        ),
        richHtml: benchmarkResults.find((b) =>
            b.name.startsWith('2. Real-world Rich Message — renderToString'),
        ),
        richEntities: benchmarkResults.find((b) =>
            b.name.startsWith('2. Real-world Rich Message — render()'),
        ),
        maxBulk: benchmarkResults.find((b) =>
            b.name.startsWith('4. High-Density Bulk Payload — renderToString'),
        ),
    };

    await sendHtmlLive(
        '10. Final Stress & Benchmark Summary Report',
        createFinalReport(passedLive, totalLive, passedExceptions, totalExceptions, benchmarks),
    );

    console.log('\n========================================================================');
    console.log(`📊 Live Telegram Suite Finished: ${passedLive}/${totalLive} passed.`);
    console.log('========================================================================\n');
}
