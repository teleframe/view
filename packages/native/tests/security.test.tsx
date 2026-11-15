/**
 * @fileoverview Unit tests for rendering security, escaping, URL validation, and TelegramSecurityError
 */

import { describe, expect, test } from 'bun:test';
import {
    Divider,
    Emoji,
    emoji,
    escapeAttr,
    escapeHtml,
    isValidUrl,
    Li,
    Link,
    RawHtml,
    render,
    renderToString,
    TelegramSecurityError,
    Time,
    User,
    user,
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
        expect(isValidUrl('https://telegram.org')).toBe(true);
        expect(isValidUrl('http://example.com')).toBe(true);
        expect(isValidUrl('tg://user?id=123456789')).toBe(true);
        expect(isValidUrl('tg://resolve?domain=telegram')).toBe(true);
        expect(isValidUrl('mailto:admin@example.com')).toBe(true);
        expect(isValidUrl('tel:+1234567890')).toBe(true);

        expect(isValidUrl('javascript:alert(1)')).toBe(false);
        expect(isValidUrl('javascript:void(0)')).toBe(false);
        expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
        expect(isValidUrl('vbscript:msgbox("test")')).toBe(false);
        expect(isValidUrl('')).toBe(false);
        expect(isValidUrl('not a url')).toBe(false);
    });

    test('RawHtml serves as an explicit escape hatch for trusted raw HTML', () => {
        const rawMarkup = '<b><i>Pre-sanitized</i></b>';
        const html = renderToString(<RawHtml html={rawMarkup} />);
        expect(html).toBe(rawMarkup);

        const result = render(<RawHtml html={rawMarkup} />);
        expect(result.text).toBe('Pre-sanitized');
    });
});

describe('TelegramSecurityError Class & Prohibited Inputs', () => {
    test('TelegramSecurityError is a proper Error subclass exported from root', () => {
        const err = new TelegramSecurityError('test security error');
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(TelegramSecurityError);
        expect(err.name).toBe('TelegramSecurityError');
        expect(err.message).toBe('test security error');
    });

    test('throws TelegramSecurityError when rendering prohibited URL schemes in Link and <a>', () => {
        const testProhibited = (node: any) => {
            expect(() => renderToString(node)).toThrow(TelegramSecurityError);
            expect(() => render(node)).toThrow(TelegramSecurityError);
        };

        testProhibited(<Link href="javascript:alert(1)">Click me</Link>);
        testProhibited(<Link href="javascript:void(0)">Click me</Link>);
        testProhibited(<Link href="data:text/html,<script>alert(1)</script>">Click me</Link>);
        testProhibited(<Link href="vbscript:msgbox(1)">Click me</Link>);
        testProhibited(<a href="javascript:alert(1)">Click me</a>);
        testProhibited(<a href="data:text/plain,hello">Click me</a>);
    });

    test('throws TelegramSecurityError for invalid or non-safe integer user IDs', () => {
        const testInvalidUser = (node: any) => {
            expect(() => renderToString(node)).toThrow(TelegramSecurityError);
            expect(() => render(node)).toThrow(TelegramSecurityError);
        };

        testInvalidUser(<User id={-1}>User</User>);
        testInvalidUser(<a href="tg://user?id=-1">User</a>);
        testInvalidUser(<User id={0}>User</User>);
        testInvalidUser(<a href="tg://user?id=0">User</a>);
        testInvalidUser(<User id={123.45}>User</User>);
        testInvalidUser(<a href="tg://user?id=123.45">User</a>);
        testInvalidUser(<User id={9007199254740992}>User</User>);
        testInvalidUser(<a href="tg://user?id=9007199254740992">User</a>);
        testInvalidUser(<a href="tg://user?id=invalid_id">User</a>);
        testInvalidUser(<a href="tg://user?id=">User</a>);

        expect(() => user('' as any, 'User')).toThrow(TelegramSecurityError);
    });

    test('throws TelegramSecurityError for invalid custom emoji IDs', () => {
        const testInvalidEmoji = (node: any) => {
            expect(() => renderToString(node)).toThrow(TelegramSecurityError);
            expect(() => render(node)).toThrow(TelegramSecurityError);
        };

        testInvalidEmoji(<Emoji id="not-a-number">🌟</Emoji>);
        testInvalidEmoji(<Emoji id="123_456">🌟</Emoji>);
        testInvalidEmoji(<tg-emoji emoji-id="abc">🌟</tg-emoji>);
        testInvalidEmoji(<tg-emoji emoji-id="12.34">🌟</tg-emoji>);

        expect(() => emoji('', '🌟')).toThrow(TelegramSecurityError);
    });
});
