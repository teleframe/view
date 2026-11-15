/**
 * @fileoverview Types for live telegram testing, benchmark results, and exceptions
 * @module example/live/types
 */

export interface LiveSendReport {
    title: string;
    mode: 'HTML' | 'ENTITIES';
    messageId?: number;
    success: boolean;
    error?: string;
    entitiesCount?: number;
    textLength?: number;
}

export interface ExceptionTestResult {
    scenario: string;
    expectedError: string;
    passed: boolean;
    actualMessage?: string;
}

export interface BenchmarkResult {
    name: string;
    iterations: number;
    durationMs: number;
    opsPerSec: number;
    avgMicroseconds: number;
}
