/**
 * @fileoverview Unit tests for integer parameter normalization, clamping, and resilience
 */

import { describe, expect, test } from 'bun:test';
import {
    Br,
    Divider,
    Li,
    List,
    normalizeInteger,
    Paragraph,
    ProgressBar,
    render,
    renderToString,
} from '../lib';

describe('Integer Parameter Normalization & Resilience', () => {
    test('normalizeInteger handles edge cases and clamps to safe bounds', () => {
        expect(normalizeInteger(undefined, 10)).toBe(10);
        expect(normalizeInteger(null, 10)).toBe(10);
        expect(normalizeInteger(NaN, 10)).toBe(10);
        expect(normalizeInteger(Infinity, 10)).toBe(10);
        expect(normalizeInteger(-Infinity, 10)).toBe(10);
        expect(normalizeInteger('not-a-number', 10)).toBe(10);

        // Clamping to bounds
        expect(normalizeInteger(-50, 10, 0, 100)).toBe(0);
        expect(normalizeInteger(200, 10, 0, 100)).toBe(100);
        expect(normalizeInteger(42, 10, 0, 100)).toBe(42);

        // Truncation
        expect(normalizeInteger(3.99, 10, 0, 100)).toBe(3);
        expect(normalizeInteger('25', 10, 0, 100)).toBe(25);
    });

    test('resilient against Infinity, NaN, and huge numbers without RangeError', () => {
        // Divider
        expect(() => {
            renderToString(
                <Divider length={Infinity} before={-10} after={NaN} spacing={100_000} />,
            );
            render(<Divider length={Infinity} before={-10} after={NaN} spacing={100_000} />);
        }).not.toThrow();

        // ProgressBar
        expect(() => {
            renderToString(<ProgressBar value={50} total={Infinity} length={Infinity} />);
            render(<ProgressBar value={50} total={Infinity} length={Infinity} />);
            renderToString(<ProgressBar value={-10} total={-5} length={-20} />);
            render(<ProgressBar value={-10} total={-5} length={-20} />);
        }).not.toThrow();

        // List
        expect(() => {
            renderToString(
                <List spacing={Infinity} indent={-5}>
                    <Li>Item 1</Li>
                    <Li>Item 2</Li>
                </List>,
            );
            render(
                <List spacing={Infinity} indent={-5}>
                    <Li>Item 1</Li>
                    <Li>Item 2</Li>
                </List>,
            );
        }).not.toThrow();

        // Paragraph
        expect(() => {
            renderToString(
                <Paragraph count={Infinity} before={-5}>
                    Text
                </Paragraph>,
            );
            render(
                <Paragraph count={Infinity} before={-5}>
                    Text
                </Paragraph>,
            );
        }).not.toThrow();

        // Br
        expect(() => {
            renderToString(<Br count={Infinity} />);
            render(<Br count={Infinity} />);
        }).not.toThrow();

        // Virtual elements: <br>, <hr>, <p>, <li>
        expect(() => {
            renderToString(<br count={Infinity as any} />);
            renderToString(<hr length={Infinity as any} before={-5 as any} after={NaN as any} />);
            renderToString(
                <p count={Infinity as any} before={-5 as any}>
                    P text
                </p>,
            );
            renderToString(<li indent={Infinity as any}>Li text</li>);

            render(<br count={Infinity as any} />);
            render(<hr length={Infinity as any} before={-5 as any} after={NaN as any} />);
            render(
                <p count={Infinity as any} before={-5 as any}>
                    P text
                </p>,
            );
            render(<li indent={Infinity as any}>Li text</li>);
        }).not.toThrow();
    });
});
