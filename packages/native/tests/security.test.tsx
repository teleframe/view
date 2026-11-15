/**
 * @fileoverview Unit tests for rendering security, escaping, URL validation,
 * TelegramSecurityError, and integer parameter normalization.
 */

import { describe, expect, test } from 'bun:test';
import {
    Br,
    Divider,
    Emoji,
    emoji,
    escapeAttr,
    escapeHtml,
    isValidUrl,
    Li,
    Link,
    List,
    normalizeInteger,
    Paragraph,
    ProgressBar,
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

    test('RawHtml serves as an explicit escape hatch for trusted raw HTML', () => {
        const rawMarkup = '<b><i>Pre-sanitized</i></b>';
        const html = renderToString(<RawHtml html={rawMarkup} />);
        expect(html).toBe(rawMarkup);

        // In entity mode, RawHtml strips tags to maintain plain text stream
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

        // Negative ID
        testInvalidUser(<User id={-1}>User</User>);
        testInvalidUser(<a href="tg://user?id=-1">User</a>);

        // Zero ID
        testInvalidUser(<User id={0}>User</User>);
        testInvalidUser(<a href="tg://user?id=0">User</a>);

        // Floating point ID
        testInvalidUser(<User id={123.45}>User</User>);
        testInvalidUser(<a href="tg://user?id=123.45">User</a>);

        // Exceeds Number.MAX_SAFE_INTEGER (9007199254740991)
        testInvalidUser(<User id={9007199254740992}>User</User>);
        testInvalidUser(<a href="tg://user?id=9007199254740992">User</a>);

        // Non-numeric string in tg://user?id
        testInvalidUser(<a href="tg://user?id=invalid_id">User</a>);
        testInvalidUser(<a href="tg://user?id=">User</a>);

        // Missing or empty ID via user() helper
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

        // Missing or empty ID via emoji() helper
        expect(() => emoji('', '🌟')).toThrow(TelegramSecurityError);
    });
});

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
