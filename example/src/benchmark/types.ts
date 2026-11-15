/**
 * @fileoverview Benchmark reporting and round types
 * @module example/benchmark/types
 */

export interface BenchmarkRound {
    opsPerSec: number;
    avgMicroseconds: number;
}

export interface BenchmarkReport {
    category: string;
    name: string;
    mode: 'HTML' | 'ENTITIES';
    medianOps: number;
    medianMicros: number;
    minMicros: number;
    maxMicros: number;
}
