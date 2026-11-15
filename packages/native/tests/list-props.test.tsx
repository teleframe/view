/**
 * @fileoverview Unit tests for List props: Li.indent, List.indentMultiline, and Each as="ol" marker
 */

import { describe, expect, test } from 'bun:test';
import { Each, Li, List, Ol, render, renderToString, Ul } from '../lib';

describe('List Component Props (Stage 6)', () => {
    test('Li.indent overrides or sets item-level indentation', () => {
        const list = (
            <Ul>
                <Li>Normal item</Li>
                <Li indent={2}>Indented sub-item</Li>
            </Ul>
        );

        const html = renderToString(list);
        expect(html).toBe('• Normal item\n    • Indented sub-item\n');
    });

    test('standalone <Li indent={...}> applies indentation spaces', () => {
        const html = renderToString(<Li indent={1}>Direct item</Li>);
        expect(html).toBe('  • Direct item\n');
    });

    test('List.indentMultiline indents subsequent lines of multiline items', () => {
        const list = (
            <List indentMultiline>
                <Li>{'First line\nSecond line\nThird line'}</Li>
            </List>
        );

        const html = renderToString(list);
        // marker is "• " (2 chars). Subsequent lines must be indented by 2 spaces.
        expect(html).toBe('• First line\n  Second line\n  Third line\n');
    });

    test('Each as="ol" supports custom string marker and generator function', () => {
        const items = ['Alpha', 'Beta'];

        // Custom string marker
        const withString = (
            <Each items={items} as="ol" marker="> ">
                {(item: string) => item}
            </Each>
        );
        const htmlString = renderToString(withString);
        expect(htmlString).toBe('&gt; Alpha\n&gt; Beta\n');
        expect(render(withString).text).toBe('> Alpha\n> Beta\n');

        // Generator function marker
        const withFunc = (
            <Each items={items} as="ol" marker={(idx) => `Step ${idx + 1}: `}>
                {(item: string) => item}
            </Each>
        );
        const htmlFunc = renderToString(withFunc);
        expect(htmlFunc).toBe('Step 1: Alpha\nStep 2: Beta\n');
    });
});
