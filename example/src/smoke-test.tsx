/**
 * @fileoverview Smoke test suite for Telegram Native markup engine
 * Sends messages directly to user chat via Telegram Bot API
 * Verifies HTML rendering, MessageEntity compilation, and edge cases.
 */

import {
    createAnnouncement,
    createBotApi9TimeDemo,
    createCodeBlockDemo,
    createEntitiesPipelineDemo,
    createEscapingDemo,
    createExpandableDocs,
    createFunctionalBuilderDemo,
    createRawHtmlDemo,
    createSummaryReport,
    createSurrogateEmojiDemo,
    createTypographyCascade,
} from './smoke/cases';
import { TARGET_CHAT_ID, reports, sendEntityTest, sendHtmlTest } from './smoke/runner';

async function runSmokeTests() {
    console.log(`\n🚀 Starting Telegram Markup Smoke Tests -> Target Chat: ${TARGET_CHAT_ID}`);
    console.log('========================================================================\n');

    await sendHtmlTest('0. Announcement Header', createAnnouncement());
    await sendHtmlTest('1. Deep Typography Cascade (HTML)', createTypographyCascade());
    await sendHtmlTest('2. Expandable Blockquote with Code & Links (HTML)', createExpandableDocs());
    await sendHtmlTest('3. CodeBlock with TypeScript Syntax (HTML)', createCodeBlockDemo());
    await sendHtmlTest('4. Escaping & Special Characters (HTML)', createEscapingDemo());
    await sendHtmlTest('5. Bot API 9.0 Time & User Mention (HTML)', createBotApi9TimeDemo());
    await sendHtmlTest('6. RawHtml Escape Hatch (HTML)', createRawHtmlDemo());
    await sendEntityTest('7. Entity Compilation Pipeline (render())', createEntitiesPipelineDemo());
    await sendEntityTest(
        '8. Surrogate Pairs & Emoji UTF-16 Offsets (render())',
        createSurrogateEmojiDemo(),
    );
    await sendHtmlTest('9. Zero-JSX Functional Builder (HTML)', createFunctionalBuilderDemo());

    const successCount = reports.filter((r) => r.success).length;
    const totalCount = reports.length;
    await sendHtmlTest('10. Final Summary Report', createSummaryReport(successCount, totalCount));

    console.log('\n========================================================================');
    console.log(`📊 Smoke Test Summary: ${successCount}/${totalCount} tests passed.`);
    console.log('========================================================================\n');

    if (successCount !== totalCount) {
        process.exit(1);
    }
}

runSmokeTests().catch((err) => {
    console.error('Fatal smoke test runner error:', err);
    process.exit(1);
});
