/**
 * @fileoverview Deno runtime verification test suite
 * Tests JSX rendering, intrinsic elements, entities compilation,
 * functional helpers, sanitization, and security in native Deno environment.
 */

if (typeof Deno !== 'undefined') {
    const {
        Bold,
        Italic,
        Underline,
        Strike,
        Spoiler,
        Link,
        User,
        Emoji,
        Blockquote,
        Code,
        CodeBlock,
        Pre,
        Br,
        Divider,
        Paragraph,
        Ul,
        Ol,
        Li,
        Show,
        Each,
        RawHtml,
        ProgressBar,
        Time,
        renderToString,
        render,
        escapeHtml,
        escapeAttr,
        bold,
        italic,
        link,
        TelegramSecurityError,
    } = await import('@teleframe/view/native');

    const rootMarkup = await import('@teleframe/view');

    Deno.test('Deno: component JSX rendering', () => {
        const html = renderToString(
            <Bold>
                Hello <Italic>World</Italic>
            </Bold>,
        );
        if (html !== '<b>Hello <i>World</i></b>') {
            throw new Error(`Unexpected HTML output: ${html}`);
        }
    });

    Deno.test('Deno: typography and decoration components', () => {
        if (renderToString(<Underline>Underlined</Underline>) !== '<u>Underlined</u>') {
            throw new Error('Underline failed');
        }
        if (renderToString(<Strike>Strikethrough</Strike>) !== '<s>Strikethrough</s>') {
            throw new Error('Strike failed');
        }
        if (renderToString(<Spoiler>Secret</Spoiler>) !== '<tg-spoiler>Secret</tg-spoiler>') {
            throw new Error('Spoiler failed');
        }
        if (
            renderToString(<Blockquote expandable>Expanded quote</Blockquote>) !==
            '<blockquote expandable>Expanded quote</blockquote>'
        ) {
            throw new Error('Blockquote failed');
        }
    });

    Deno.test('Deno: links, user mentions, and custom emoji', () => {
        if (
            renderToString(<Link href="https://deno.land">Deno</Link>) !==
            '<a href="https://deno.land">Deno</a>'
        ) {
            throw new Error('Link failed');
        }
        if (
            renderToString(<User id={123456789}>Developer</User>) !==
            '<a href="tg://user?id=123456789">Developer</a>'
        ) {
            throw new Error('User failed');
        }
        if (
            renderToString(<Emoji id="5368324170671202286">🔥</Emoji>) !==
            '<tg-emoji emoji-id="5368324170671202286">🔥</tg-emoji>'
        ) {
            throw new Error('Emoji failed');
        }
    });

    Deno.test('Deno: code blocks and syntax highlighting', () => {
        const block = renderToString(<CodeBlock language="typescript">const x = 42;</CodeBlock>);
        if (block !== '<pre><code class="language-typescript">const x = 42;</code></pre>') {
            throw new Error(`CodeBlock failed: ${block}`);
        }
    });

    Deno.test('Deno: control flow components (Show, Each)', () => {
        const visible = renderToString(
            <Show when={true} fallback="Hidden">
                Visible
            </Show>,
        );
        if (visible !== 'Visible') throw new Error('Show when=true failed');

        const hidden = renderToString(
            <Show when={false} fallback="Fallback">
                Visible
            </Show>,
        );
        if (hidden !== 'Fallback') throw new Error('Show when=false failed');

        const items = ['Deno', 'Bun', 'Node'];
        const list = renderToString(
            <Each items={items} as="ul" marker="• ">
                {(item: string) => item}
            </Each>,
        );
        if (list !== '• Deno\n• Bun\n• Node\n') {
            throw new Error(`Each / List failed: ${list}`);
        }
    });

    Deno.test('Deno: functional builders API', () => {
        const html = renderToString(
            bold(['Text ', italic('italic'), ' and ', link('https://deno.com', 'Deno')]),
        );
        if (html !== '<b>Text <i>italic</i> and <a href="https://deno.com">Deno</a></b>') {
            throw new Error(`Functional HTML mismatch: ${html}`);
        }
    });

    Deno.test('Deno: native entity compilation (render)', () => {
        const { text, entities } = render(
            <b>
                Hello <i>Deno</i> <a href="https://deno.land">Website</a>
            </b>,
        );
        if (text !== 'Hello Deno Website') throw new Error(`Unexpected rendered text: "${text}"`);
        if (entities.length !== 3) throw new Error(`Expected 3 entities, got ${entities.length}`);

        const [boldEnt, italicEnt, linkEnt] = entities;
        if (boldEnt.type !== 'bold' || boldEnt.offset !== 0 || boldEnt.length !== 18) {
            throw new Error(`Invalid bold entity: ${JSON.stringify(boldEnt)}`);
        }
        if (italicEnt.type !== 'italic' || italicEnt.offset !== 6 || italicEnt.length !== 4) {
            throw new Error(`Invalid italic entity: ${JSON.stringify(italicEnt)}`);
        }
        if (linkEnt.type !== 'text_link' || (linkEnt as any).url !== 'https://deno.land') {
            throw new Error(`Invalid link entity: ${JSON.stringify(linkEnt)}`);
        }
    });

    Deno.test('Deno: HTML escaping & security validation', () => {
        if (
            escapeHtml('<script>alert("xss")</script>') !==
            '&lt;script&gt;alert("xss")&lt;/script&gt;'
        ) {
            throw new Error('escapeHtml failed');
        }
        if (escapeAttr('"hello & goodbye"') !== '&quot;hello &amp; goodbye&quot;') {
            throw new Error('escapeAttr failed');
        }

        // Test TelegramSecurityError on unsafe protocol
        let threw = false;
        try {
            renderToString(<Link href="javascript:alert(1)">Dangerous</Link>);
        } catch (err) {
            if (err instanceof TelegramSecurityError) {
                threw = true;
            }
        }
        if (!threw) throw new Error('Expected TelegramSecurityError for javascript: protocol');
    });

    Deno.test('Deno: root umbrella package re-exports', () => {
        const html = rootMarkup.renderToString(rootMarkup.Bold({ children: 'Root working!' }));
        if (html !== '<b>Root working!</b>') {
            throw new Error(`Root package failed: ${html}`);
        }

        const namespaced = rootMarkup.Native.renderToString(
            rootMarkup.Native.italic('Namespaced works!'),
        );
        if (namespaced !== '<i>Namespaced works!</i>') {
            throw new Error(`Namespaced Native failed: ${namespaced}`);
        }
    });
}
