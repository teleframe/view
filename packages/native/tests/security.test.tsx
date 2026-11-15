/**
 * @fileoverview Unit tests for rendering security, escaping, and URL validation
 */

import { describe, expect, test } from 'bun:test';
import {
    Divider,
    escapeAttr,
    escapeHtml,
    isValidUrl,
    Li,
    Link,
    RawHtml,
    render,
    renderToString,
    Time,
} from '../lib';

describe('Render Security & Escaping Consistency', () => {
    test('escapes malicious characters inside Divider char prop', () => {
        const html = renderToString(<Divider char="<script>" length={2} before={0} after={0} />);
        expect(html).not.toContain('<script>');
        expect(html).toBe('&lt;script&gt;&lt;script&gt;');
    });

    test('escapes malicious characters inside Li marker prop', () => {
        const html = renderToString(<Li marker="<img src=x onerror=alert(1)>">Item</Li>);
        expect(html).not.toContain('<img');
        expect(html).toBe('&lt;img src=x onerror=alert(1)&gt;Item\n');
    });

    test('escapes malicious characters inside Time fallback text', () => {
        const html = renderToString(
            <Time unix={1718000000} format="r">
                {'<script>alert("hacked")</script>'}
            </Time>,
        );
        expect(html).not.toContain('<script>');
        expect(html).toBe(
            '<tg-time unix="1718000000" format="r">&lt;script&gt;alert("hacked")&lt;/script&gt;</tg-time>',
        );
    });

    test('escapes attribute values and quotes properly', () => {
        expect(escapeAttr('value"with"quotes & <tags>')).toBe(
            'value&quot;with&quot;quotes &amp; &lt;tags&gt;',
        );
    });

    test('strips arbitrary attributes not recognized by Telegram Bot API', () => {
        const el = <b {...({ onclick: 'alert(1)', style: 'color:red' } as any)}>Bold text</b>;
        const html = renderToString(el);
        expect(html).toBe('<b>Bold text</b>');
        expect(html).not.toContain('onclick');
        expect(html).not.toContain('style');
    });

    test('validates safe and prohibited URLs', () => {
        // Safe URLs
        expect(isValidUrl('https://telegram.org')).toBe(true);
        expect(isValidUrl('http://example.com')).toBe(true);
        expect(isValidUrl('tg://user?id=123456789')).toBe(true);
        expect(isValidUrl('tg://resolve?domain=telegram')).toBe(true);
        expect(isValidUrl('mailto:admin@example.com')).toBe(true);
        expect(isValidUrl('tel:+1234567890')).toBe(true);

        // Prohibited URLs
        expect(isValidUrl('javascript:alert(1)')).toBe(false);
        expect(isValidUrl('javascript:void(0)')).toBe(false);
        expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
        expect(isValidUrl('vbscript:msgbox("test")')).toBe(false);
        expect(isValidUrl('')).toBe(false);
        expect(isValidUrl('not a url')).toBe(false);
    });

    test('throws security error when rendering prohibited URL in Link', () => {
        expect(() => {
            renderToString(<Link href="javascript:alert(1)">Click me</Link>);
        }).toThrow(/Security Error: Invalid or prohibited URL/);

        expect(() => {
            render(<Link href="javascript:alert(1)">Click me</Link>);
        }).toThrow(/Security Error: Invalid or prohibited URL/);
    });

    test('RawHtml serves as an explicit escape hatch for trusted raw HTML', () => {
        const rawMarkup = '<b><i>Pre-sanitized</i></b>';
        const html = renderToString(<RawHtml html={rawMarkup} />);
        expect(html).toBe(rawMarkup);

        // In entity mode, RawHtml strips tags to maintain plain text stream
        const result = render(<RawHtml html={rawMarkup} />);
        expect(result.text).toBe('Pre-sanitized');
    });
});
