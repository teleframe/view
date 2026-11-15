/**
 * @fileoverview Demonstration page built with Zero-JSX Functional Builder API
 * Written in pure TypeScript (.ts) with zero JSX configuration and using lowercase service helpers.
 * @module examples/src/pages/functional
 */

import {
    blockquote,
    bold,
    br,
    code,
    codeblock,
    divider,
    each,
    emoji,
    hr,
    italic,
    li,
    link,
    mono,
    ol,
    p,
    paragraph,
    progress,
    renderHtml,
    show,
    spoiler,
    strike,
    time,
    ul,
    underline,
    user,
} from '@teleframe/view';

export interface FunctionalPageProps {
    userId: number;
    firstName: string;
}

/**
 * Builds and renders the Functional API showcase page using pure function composition.
 * Zero JSX tags are used in this file — only lowercase service functions!
 */
export const renderFunctionalPage = (props: FunctionalPageProps): string => {
    const isVipUser = true;
    const now = new Date();

    const content = [
        bold('⚡ Path 4: Zero-JSX Functional Builder API'),
        br(2),
        'You can compose rich, type-safe Telegram messages in standard ',
        code('.ts'),
        ' or ',
        code('.js'),
        ' files without any JSX compiler or tsconfig modifications using lightweight lowercase functions.',
        divider('━', 25),

        bold('1. Typography Helpers:'),
        br(),
        '• ',
        bold('bold("Bold text")'),
        ' → ',
        bold('Bold text'),
        br(),
        '• ',
        italic('italic("Italic text")'),
        ' → ',
        italic('Italic text'),
        br(),
        '• ',
        underline('underline("Underlined")'),
        ' → ',
        underline('Underlined'),
        br(),
        '• ',
        strike('strike("Strikethrough")'),
        ' → ',
        strike('Strikethrough'),
        br(),
        '• ',
        spoiler('spoiler("Secret data")'),
        ' → ',
        spoiler('Secret data'),
        br(),
        '• ',
        mono('mono("Monospace")'),
        ' → ',
        mono('Monospace'),
        br(2),

        bold('2. Smart Mentions, Links & Emoji:'),
        br(),
        '• User mention: ',
        user(props.userId, props.firstName),
        br(),
        '• Hyperlink: ',
        link('https://github.com/teleframe/view', 'GitHub Repo'),
        br(),
        '• Custom Emoji: ',
        emoji('5368324170671202286', '👍'),
        ' (Telegram Premium custom emoji)',
        divider('━', 25),

        bold('3. Date & Time (Bot API 9.0):'),
        br(),
        '• Relative: ',
        time(now, 'relative'),
        br(),
        '• Formatted Date: ',
        time(now, 'date-long'),
        br(2),

        bold('4. Structural Paragraphs & Quotes:'),
        br(),
        paragraph([
            'This paragraph was constructed via ',
            code('paragraph(["...", italic("...")])'),
            ' with clean automated spacing.',
        ]),
        p(['Shorthand paragraph via ', code('p(...)'), ' is also available.']),
        blockquote([
            bold('💡 Zero-Config Philosophy:'),
            br(),
            'No babel, no swc, no tsconfig jsxImportSource. Import lowercase functions and start composing instantly!',
        ]),
        divider('━', 25),

        bold('5. Lists & Progress Widgets:'),
        br(),
        ul({
            bullet: 'check',
            children: [
                li([bold('No tsconfig lock-in'), ' — works in any TypeScript/JavaScript project']),
                li([bold('Zero pragma comments'), ' — no file-level annotations required']),
                li([bold('Full type-safety'), ' — complete IDE autocompletion']),
            ],
        }),
        br(),
        'Numbered sequence via ',
        code('ol()'),
        ':',
        br(),
        ol({
            start: 1,
            numberStyle: 'roman',
            children: [
                li('Install package: bun add @teleframe/view'),
                li('Import lowercase functions'),
                li('Call renderHtml(message) or render(message)'),
            ],
        }),
        br(),
        'Progress bar helper via ',
        code('progress()'),
        ':',
        br(),
        progress({ value: 85, total: 100, style: 'bar', showPercent: true }),
        divider('━', 25),

        bold('6. Conditional Flow & Iteration:'),
        br(),
        show({
            when: isVipUser,
            children: ['Status: ', bold('🌟 VIP Subscriber Active')],
            fallback: 'Status: Standard Member',
        }),
        br(),
        'Iteration via ',
        code('each()'),
        ':',
        br(),
        each({
            items: ['TypeScript', 'Bun', 'grammY'],
            as: 'ul',
            marker: '• ',
            render: (tech) => [bold(tech), ' runtime'],
        }),
        divider('━', 25),

        bold('7. Code Block Helper:'),
        br(),
        codeblock(
            "import { bold, italic, renderHtml } from '@teleframe/view';\n\nconst msg = [bold('Hello'), ' ', italic('world!')];\nconst html = renderHtml(msg);",
            'typescript',
        ),
        hr(),
        italic('⚡ Pure functional composition — identical, pixel-perfect Telegram formatting.'),
    ];

    return renderHtml(content);
};

export default renderFunctionalPage;
