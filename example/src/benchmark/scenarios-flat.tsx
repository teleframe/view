/**
 * @fileoverview Flat benchmark scenario trees
 * @module example/benchmark/scenarios-flat
 */

import {
    Bold,
    Code,
    Italic,
    Li,
    Paragraph,
    Ul,
    render,
    renderToString,
} from '@teleframe/view/native';
import { measureScenario } from './runner';

export function runFlatScenarios(): void {
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
