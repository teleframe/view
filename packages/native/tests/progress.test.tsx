/**
 * @fileoverview Unit tests for ProgressBar and Progress components
 */

import { describe, expect, test } from 'bun:test';
import { Progress, ProgressBar } from '../lib/components/progress';
import { renderToString } from '../lib/render';

describe('ProgressBar Component', () => {
    test('renders standard block progress bar', () => {
        const el = <ProgressBar value={50} total={100} size={10} />;
        expect(renderToString(el)).toBe('■■■■■□□□□□');
    });

    test('appends percent and fraction value when requested', () => {
        const el = <ProgressBar value={8} total={10} size={10} showPercent showValue />;
        expect(renderToString(el)).toBe('■■■■■■■■□□ 80% (8/10)');
    });

    test('renders emoji style progress bar', () => {
        const el = <ProgressBar value={3} total={5} size={5} style="emoji" />;
        expect(renderToString(el)).toBe('🟩🟩🟩⬜⬜');
    });

    test('renders slider style with thumb', () => {
        const el = <ProgressBar value={5} total={10} size={10} style="slider" />;
        expect(renderToString(el)).toBe('━━━━━🔘━━━━');
    });

    test('supports prefix and suffix', () => {
        const el = <ProgressBar value={100} prefix="[ " suffix=" ]" />;
        expect(renderToString(el)).toBe('[ ■■■■■■■■■■ ]');
    });

    test('wraps output in code tag when mono=true', () => {
        const el = <ProgressBar value={50} mono />;
        expect(renderToString(el)).toBe('<code>■■■■■□□□□□</code>');
    });

    test('Progress is an alias of ProgressBar', () => {
        expect(Progress).toBe(ProgressBar);
    });
});
