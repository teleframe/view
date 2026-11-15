/**
 * @fileoverview Comprehensive Stress, Benchmark, Exception & Live Telegram Verification Suite
 * Tests:
 * 1. Extreme & non-obvious nestings (identical boundaries, max cascade depth, emoji/surrogates).
 * 2. Message limits boundary tests (exact 4096 characters vs 4097 overflow).
 * 3. Exception & safety checks (TelegramNestingError, TelegramLimitError, security checks).
 * 4. High-precision performance benchmarks (throughput, latency, depth scaling).
 * 5. Live Telegram Bot API verification & reporting sent directly to user.
 */

import { runBenchmarks } from './live/benchmarks';
import { exceptionResults, runExceptionTests } from './live/exceptions';
import { liveReports } from './live/runner';
import { runLiveTelegramSuite } from './live/suite';

async function main() {
    console.log('================================================================================');
    console.log('🧪 TELEFRAME VIEW — MAXIMUM STRESS, BENCHMARK & EXCEPTION TEST SUITE');
    console.log('================================================================================');

    // Step 1: Run exception tests locally
    runExceptionTests();

    // Step 2: Run performance benchmarks
    runBenchmarks();

    // Step 3: Run live Telegram verification
    await runLiveTelegramSuite();

    const anyExceptionFailed = exceptionResults.some((r) => !r.passed);
    const anyLiveFailed = liveReports.some((r) => !r.success);

    if (anyExceptionFailed || anyLiveFailed) {
        console.error('❌ One or more stress tests failed!');
        process.exit(1);
    } else {
        console.log(
            '🎉 ALL STRESS, BENCHMARK, LIMIT & LIVE TELEGRAM TESTS COMPLETED SUCCESSFULLY!',
        );
    }
}

main().catch((err) => {
    console.error('Fatal stress suite runner error:', err);
    process.exit(1);
});
