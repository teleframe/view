/**
 * @fileoverview Boundary limits, unicode encodings, and validation benchmarks
 * @module example/benchmark/scenarios-edge
 */

import {
    Blockquote,
    Bold,
    Italic,
    Link,
    Paragraph,
    RawHtml,
    Spoiler,
    TELEGRAM_LIMITS,
    Underline,
    render,
    renderToString,
} from '@teleframe/view/native';
import { measureScenario } from './runner';
import { realWorldTree } from './scenarios-nested';

export function runEdgeScenarios() {
    console.log('\n📂 3. ГРАНИЧНЫЕ СООБЩЕНИЯ (Boundary Messages / Limits & Encodings):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    const limitHeader = '📏 Exact 4096 UTF-16 Code Units Limit Message\n\n';
    const limitFooter = '\n\n[End of message: exactly 4096 characters]';
    const fillerLength =
        TELEGRAM_LIMITS.MESSAGE_MAX_LENGTH - (limitHeader.length + limitFooter.length);
    const fillerText = '•'.repeat(fillerLength);
    const exact4096Tree = [
        <Bold>{limitHeader}</Bold>,
        <Blockquote expandable>
            <Italic>{fillerText}</Italic>
        </Blockquote>,
        <Bold>{limitFooter}</Bold>,
    ];
    measureScenario(
        'Boundary Messages',
        '3.1 Exact 4096 UTF-16 Limit Message',
        'HTML',
        1000,
        5,
        () => {
            renderToString(exact4096Tree, { validate: 'message' });
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.1 Exact 4096 UTF-16 Limit Message',
        'ENTITIES',
        1000,
        5,
        () => {
            render(exact4096Tree, { validate: 'message' });
        },
    );

    const captionHeader = '📷 Photo Caption: ';
    const captionFillerLength = TELEGRAM_LIMITS.CAPTION_MAX_LENGTH - captionHeader.length;
    const captionFiller = 'C'.repeat(captionFillerLength);
    const exact1024CaptionTree = [<Bold>{captionHeader}</Bold>, <Italic>{captionFiller}</Italic>];
    measureScenario(
        'Boundary Messages',
        '3.2 Exact 1024 UTF-16 Limit Caption',
        'HTML',
        2000,
        5,
        () => {
            renderToString(exact1024CaptionTree, { validate: 'caption' });
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.2 Exact 1024 UTF-16 Limit Caption',
        'ENTITIES',
        2000,
        5,
        () => {
            render(exact1024CaptionTree, { validate: 'caption' });
        },
    );

    const unicodeTree = (
        <Paragraph>
            🚀 <Bold>Rocket</Bold> 🌍 <Italic>Earth</Italic> ✨ <Underline>Sparkles</Underline> 🔥{' '}
            <Spoiler>Fire</Spoiler>
            <br />
            Complex family emoji (ZWJ): 👨‍👩‍👧‍👦 | Flag sequences: 🇺🇳 🇬🇧 🇯🇵
            <br />
            Math &amp; Multilingual scripts: ∫ f(x)dx = ∑ a_n · x^n | 東京 | Привет мир! | مرحبا
        </Paragraph>
    );
    measureScenario(
        'Boundary Messages',
        '3.3 Multibyte Unicode & Surrogate Pairs',
        'HTML',
        5000,
        5,
        () => {
            renderToString(unicodeTree);
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.3 Multibyte Unicode & Surrogate Pairs',
        'ENTITIES',
        5000,
        5,
        () => {
            render(unicodeTree);
        },
    );

    const rawHtmlTree = (
        <Paragraph>
            <RawHtml html='<span class="tg-spoiler">Numerical entities: &#38; and &#x26;</span>' />
            <br />
            <Link href="https://example.com/search?q=telegram&amp;category=bots&amp;sort=asc">
                Escaped ampersands in query parameters
            </Link>
        </Paragraph>
    );
    measureScenario(
        'Boundary Messages',
        '3.4 RawHtml & Numerical References',
        'HTML',
        5000,
        5,
        () => {
            renderToString(rawHtmlTree);
        },
    );
    measureScenario(
        'Boundary Messages',
        '3.4 RawHtml & Numerical References',
        'ENTITIES',
        5000,
        5,
        () => {
            render(rawHtmlTree);
        },
    );
}

export function runValidationScenarios() {
    console.log('\n📂 4. ОВЕРХЕД ВАЛИДАЦИИ (Validation Overhead Analysis):');
    console.log(
        '------------------------------------------------------------------------------------------------',
    );

    measureScenario(
        'Validation Overhead',
        '4.1 Compound Dashboard (NO validate)',
        'HTML',
        5000,
        5,
        () => {
            renderToString(realWorldTree);
        },
    );
    measureScenario(
        'Validation Overhead',
        '4.1 Compound Dashboard (WITH validate)',
        'HTML',
        5000,
        5,
        () => {
            renderToString(realWorldTree, { validate: 'message' });
        },
    );
    measureScenario(
        'Validation Overhead',
        '4.2 Compound Dashboard (NO validate)',
        'ENTITIES',
        5000,
        5,
        () => {
            render(realWorldTree);
        },
    );
    measureScenario(
        'Validation Overhead',
        '4.2 Compound Dashboard (WITH validate)',
        'ENTITIES',
        5000,
        5,
        () => {
            render(realWorldTree, { validate: 'message' });
        },
    );
}
