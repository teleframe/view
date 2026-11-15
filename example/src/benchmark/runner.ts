/**
 * @fileoverview High-precision benchmark runner and statistics engine
 * @module example/benchmark/runner
 */

import type { BenchmarkReport, BenchmarkRound } from './types';

export const reports: BenchmarkReport[] = [];

export function measureScenario(
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
