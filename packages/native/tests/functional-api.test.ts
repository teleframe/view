import { describe, expect, it } from 'bun:test';
import {
    blockquote,
    bold,
    Bold,
    br,
    code,
    codeblock,
    divider,
    each,
    emoji,
    hr,
    italic,
    Italic,
    li,
    link,
    Link,
    mono,
    p,
    paragraph,
    pre,
    progress,
    rawHtml,
    renderHtml,
    show,
    spoiler,
    strike,
    time,
    ul,
    underline,
    user,
} from '../lib/index';

describe('Zero-JSX Functional Builder API', () => {
    it('renders basic formatting helpers in pure TypeScript', () => {
        expect(renderHtml(bold('Hello'))).toBe('<b>Hello</b>');
        expect(renderHtml(italic('World'))).toBe('<i>World</i>');
        expect(renderHtml(underline('Important'))).toBe('<u>Important</u>');
        expect(renderHtml(strike('Deleted'))).toBe('<s>Deleted</s>');
        expect(renderHtml(spoiler('Secret'))).toBe('<tg-spoiler>Secret</tg-spoiler>');
        expect(renderHtml(code('const x = 10;'))).toBe('<code>const x = 10;</code>');
        expect(renderHtml(mono('mono text'))).toBe('<code>mono text</code>');
        expect(renderHtml(pre('multi\nline'))).toBe('<pre>multi\nline</pre>');
        expect(renderHtml(blockquote('A famous quote'))).toBe(
            '<blockquote>A famous quote</blockquote>',
        );
    });

    it('renders links and user mentions with functional syntax', () => {
        expect(renderHtml(link('https://example.com', 'Click Here'))).toBe(
            '<a href="https://example.com">Click Here</a>',
        );
        expect(renderHtml(user(12345678, 'Alex'))).toBe('<a href="tg://user?id=12345678">Alex</a>');
        expect(renderHtml(emoji('5368324170671202286', '👍'))).toBe(
            '<tg-emoji emoji-id="5368324170671202286">👍</tg-emoji>',
        );
    });

    it('renders line breaks, dividers, and paragraphs', () => {
        expect(renderHtml(br())).toBe('\n');
        expect(renderHtml(br(2))).toBe('\n\n');
        expect(renderHtml(divider('━', 10))).toBe('\n━━━━━━━━━━\n');
        expect(renderHtml(hr())).toBe('\n————————————————————\n');
        expect(renderHtml(paragraph('First paragraph', 1))).toBe('First paragraph\n');
        expect(renderHtml(p('Compact', 1))).toBe('Compact\n');
    });

    it('renders codeblocks and rawHtml', () => {
        expect(renderHtml(codeblock('const a = 1;', 'ts'))).toBe(
            '<pre><code class="language-ts">const a = 1;</code></pre>',
        );
        expect(renderHtml(rawHtml('<b>trusted raw</b>'))).toBe('<b>trusted raw</b>');
    });

    it('renders progress bar functional helper', () => {
        expect(renderHtml(progress({ value: 50, total: 100, showPercent: true }))).toBe(
            '■■■■■□□□□□ 50%',
        );
    });

    it('renders uppercase components when called directly as functions', () => {
        expect(renderHtml(Bold('Uppercase Bold'))).toBe('<b>Uppercase Bold</b>');
        expect(renderHtml(Italic('Uppercase Italic'))).toBe('<i>Uppercase Italic</i>');
        expect(renderHtml(Link('https://example.com', 'Uppercase Link'))).toBe(
            '<a href="https://example.com">Uppercase Link</a>',
        );
    });

    it('supports deep nested functional composition without JSX', () => {
        const message = [
            bold('Order #1042'),
            br(2),
            paragraph(['Customer: ', user(998877, 'John Doe')]),
            ul({
                children: [li(['Status: ', italic('Delivered')]), li(['Code: ', code('ABC-990')])],
            }),
            divider('—', 15),
            link('https://example.com/orders/1042', 'View Details'),
        ];

        const html = renderHtml(message);
        expect(html).toContain('<b>Order #1042</b>');
        expect(html).toContain('<a href="tg://user?id=998877">John Doe</a>');
        expect(html).toContain('<i>Delivered</i>');
        expect(html).toContain('<code>ABC-990</code>');
        expect(html).toContain('<a href="https://example.com/orders/1042">View Details</a>');
    });

    it('supports functional time helper', () => {
        const d = new Date('2025-05-10T12:00:00Z');
        const unixSec = Math.floor(d.getTime() / 1000);
        const html = renderHtml(time(d, 'relative'));
        expect(html).toContain('<tg-time');
        expect(html).toContain(`unix="${unixSec}"`);
        expect(html).toContain('format="r"');
    });

    it('supports show and each functional helpers', () => {
        const truthy = show({ when: true, children: bold('Visible') });
        const falsy = show({ when: false, fallback: italic('Hidden') });
        expect(renderHtml(truthy)).toBe('<b>Visible</b>');
        expect(renderHtml(falsy)).toBe('<i>Hidden</i>');

        const items = each({
            items: ['Apple', 'Banana'],
            render: (fruit) => bold(fruit),
        });
        expect(renderHtml(items)).toBe('<b>Apple</b>\n<b>Banana</b>');
    });
});
