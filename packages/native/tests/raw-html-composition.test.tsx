/**
 * @fileoverview Unit tests for RawHtml component composition, nesting, and entity mode
 */

import { describe, expect, test } from 'bun:test';
import {
    Blockquote,
    Bold,
    Br,
    Each,
    Italic,
    Li,
    Paragraph,
    RawHtml,
    rawHtml,
    render,
    renderToString,
    Show,
    Ul,
    user,
} from '../lib';

describe('RawHtml - Nesting within JSX Containers and Components', () => {
    test('renders inside Paragraph component', () => {
        const element = (
            <Paragraph>
                Prefix <RawHtml html="<b>bold raw</b>" /> and{' '}
                <RawHtml html="<code>code raw</code>" /> suffix.
            </Paragraph>
        );
        expect(renderToString(element)).toBe(
            'Prefix <b>bold raw</b> and <code>code raw</code> suffix.\n\n',
        );
    });

    test('renders inside Blockquote component', () => {
        const element = (
            <Blockquote expandable>
                <RawHtml html="<b>Warning:</b> Service will restart soon." />
            </Blockquote>
        );
        expect(renderToString(element)).toBe(
            '<blockquote expandable><b>Warning:</b> Service will restart soon.</blockquote>',
        );
    });

    test('renders inside Ul and Li list components', () => {
        const element = (
            <Ul>
                <Li>
                    <RawHtml html="<code>item_1</code>: enabled" />
                </Li>
                <Li>
                    <RawHtml html="<code>item_2</code>: <b>disabled</b>" />
                </Li>
            </Ul>
        );
        expect(renderToString(element)).toBe(
            '• <code>item_1</code>: enabled\n• <code>item_2</code>: <b>disabled</b>\n',
        );
    });

    test('renders inside Show conditional component', () => {
        const visibleElement = (
            <Show when={true} fallback={<RawHtml html="<i>Fallback</i>" />}>
                <RawHtml html="<b>Visible raw content</b>" />
            </Show>
        );
        expect(renderToString(visibleElement)).toBe('<b>Visible raw content</b>');

        const fallbackElement = (
            <Show when={false} fallback={<RawHtml html="<i>Fallback content</i>" />}>
                <RawHtml html="<b>Hidden content</b>" />
            </Show>
        );
        expect(renderToString(fallbackElement)).toBe('<i>Fallback content</i>');
    });

    test('renders inside Each collection iterator', () => {
        const tags = ['typescript', 'bun', 'telegram'];
        const element = (
            <Each items={tags} separator=" | ">
                {(tag: string) => <RawHtml html={`<code>#${tag}</code>`} />}
            </Each>
        );
        expect(renderToString(element)).toBe(
            '<code>#typescript</code> | <code>#bun</code> | <code>#telegram</code>',
        );
    });
});

describe('RawHtml - Mixed Composition with JSX & Functional Helpers', () => {
    test('seamlessly mixes JSX components, functional helpers, and RawHtml', () => {
        const element = (
            <>
                <Bold>System Notification</Bold>
                <Br />
                {user(987654321, 'Admin')}
                {' executed payload:'}
                <Br />
                {rawHtml('<pre><code class="language-json">{"ok": true}</code></pre>')}
                <Br />
                <Italic>Status: </Italic>
                <RawHtml html="<b>ONLINE</b>" />
            </>
        );

        const expected = [
            '<b>System Notification</b>',
            '\n',
            '<a href="tg://user?id=987654321">Admin</a>',
            ' executed payload:',
            '\n',
            '<pre><code class="language-json">{"ok": true}</code></pre>',
            '\n',
            '<i>Status: </i>',
            '<b>ONLINE</b>',
        ].join('');

        expect(renderToString(element)).toBe(expected);
    });
});

describe('RawHtml - HTML Entities Preservation & Multiline', () => {
    test('does not double escape pre-sanitized HTML entities', () => {
        const preEscaped = 'Math: 1 &lt; 2 &amp;&amp; 3 &gt; 2; Quote: &quot;hello&quot;';
        const result = renderToString(<RawHtml html={preEscaped} />);
        expect(result).toBe(preEscaped);
        expect(result).not.toContain('&amp;lt;');
        expect(result).not.toContain('&amp;amp;');
    });

    test('preserves whitespace and indentation in multiline raw HTML', () => {
        const multiline = `
<pre><code class="language-python">def hello():
    print("Hello, world!")
</code></pre>`.trim();

        const result = renderToString(<RawHtml html={multiline} />);
        expect(result).toBe(multiline);
    });
});

describe('RawHtml - Entity Compilation Mode (render())', () => {
    test('strips HTML tags to maintain plain text stream when compiling entities', () => {
        const element = (
            <>
                <Bold>Header</Bold>
                <Br />
                <RawHtml html="Plain text with <i>nested</i> and <code>inline</code> tags." />
            </>
        );

        const result = render(element);
        expect(result.text).toBe('Header\nPlain text with nested and inline tags.');
        expect(result.entities).toHaveLength(1);
        expect(result.entities[0]).toEqual({
            type: 'bold',
            offset: 0,
            length: 6,
        });
    });

    test('strips complex tags like blockquote, pre and code in entity mode', () => {
        const result = render(
            <RawHtml html='<blockquote expandable>Quoted content</blockquote> and <pre><code class="language-js">let a = 1;</code></pre>' />,
        );
        expect(result.text).toBe('Quoted content and let a = 1;');
        expect(result.entities).toEqual([]);
    });
});
