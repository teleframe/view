/**
 * @fileoverview Unit tests for Show conditional rendering and Each collection mapping
 */

import { describe, expect, test } from 'bun:test';
import { Each } from '../lib/components/each';
import { Show } from '../lib/components/show';
import { renderToString } from '../lib/render';

describe('Show Conditional Rendering', () => {
    test('renders children when condition is truthy', () => {
        const el = (
            <Show when={true}>
                <b>Visible</b>
            </Show>
        );
        expect(renderToString(el)).toBe('<b>Visible</b>');
    });

    test('renders fallback when condition is falsy', () => {
        const el = (
            <Show when={false} fallback={<i>Empty</i>}>
                <b>Hidden</b>
            </Show>
        );
        expect(renderToString(el)).toBe('<i>Empty</i>');
    });

    test('unwraps value when children is a function', () => {
        interface User {
            name: string;
        }
        const user: User | null = { name: 'Alice' };

        const el = <Show when={user}>{(u: User) => <b>Hello, {u.name}!</b>}</Show>;
        expect(renderToString(el)).toBe('<b>Hello, Alice!</b>');
    });
});

describe('Each Collection Iterator', () => {
    const fruits = ['Apple', 'Banana', 'Cherry'];

    test('renders plain collection with default Br separator', () => {
        const el = <Each items={fruits} />;
        expect(renderToString(el)).toBe('Apple\nBanana\nCherry');
    });

    test('supports custom separator', () => {
        const el = <Each items={fruits} separator=" | " />;
        expect(renderToString(el)).toBe('Apple | Banana | Cherry');
    });

    test('compiles to unordered list when as="ul"', () => {
        const el = (
            <Each items={fruits} as="ul" marker="— ">
                {(item: string) => item}
            </Each>
        );
        const output = renderToString(el);
        expect(output).toContain('— Apple\n');
        expect(output).toContain('— Banana\n');
        expect(output).toContain('— Cherry\n');
    });

    test('compiles to ordered list when as="ol"', () => {
        const el = (
            <Each items={fruits} as="ol" start={1}>
                {(item: string) => item}
            </Each>
        );
        const output = renderToString(el);
        expect(output).toContain('1. Apple\n');
        expect(output).toContain('2. Banana\n');
        expect(output).toContain('3. Cherry\n');
    });

    test('renders fallback for empty or null array', () => {
        const el = <Each items={[]} fallback={<i>No items</i>} />;
        expect(renderToString(el)).toBe('<i>No items</i>');
    });
});
