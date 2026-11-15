/**
 * @fileoverview Pure Local High-Precision Benchmark Suite for @teleframe/view/native
 * Runs reproducible multi-round performance measurements across:
 * 1. Flat Messages (disjoint entities)
 * 2. Nested Messages (cascading hierarchies & identical boundaries)
 * 3. Boundary Messages (exact 4096 message, 1024 caption, surrogate pairs, RawHtml)
 * 4. Validation Overhead Analysis (validate: 'message' / 'caption')
 */

import { runEdgeScenarios, runValidationScenarios } from './benchmark/scenarios-edge';
import { runFlatScenarios } from './benchmark/scenarios-flat';
import { runNestedScenarios } from './benchmark/scenarios-nested';

function runBenchmarkSuite() {
    console.log(
        '\n================================================================================================',
    );
    console.log('⚡ TELEFRAME VIEW — REPRODUCIBLE MULTI-ROUND BENCHMARK SUITE (5 ROUNDS / MEDIAN)');
    console.log(
        '================================================================================================',
    );

    runFlatScenarios();
    runNestedScenarios();
    runEdgeScenarios();
    runValidationScenarios();

    console.log(
        '\n================================================================================================',
    );
    console.log('✨ BENCHMARK SUITE COMPLETED SUCCESSFULLY ACROSS ALL SCENARIOS!');
    console.log(
        '================================================================================================\n',
    );
}

runBenchmarkSuite();
