/**
 * @fileoverview Prohibited nestings and boundary exception tests
 * @module example/live/exceptions
 */

import {
    Blockquote,
    Bold,
    Code,
    Italic,
    Link,
    Pre,
    TelegramLimitError,
    TelegramNestingError,
    Time,
    User,
    renderToString,
    validateEntitiesOverlap,
} from '@teleframe/view/native';
import type { ExceptionTestResult } from './types';

export const exceptionResults: ExceptionTestResult[] = [];

export function runExceptionTests(): void {
    console.log('\n🔒 Running Exception & Prohibited Nesting Tests...');
    console.log('----------------------------------------------------');

    const testCases: { name: string; run: () => void; expectedErrorType: any }[] = [
        {
            name: 'Bold > Code (Forbidden in Bot API)',
            run: () =>
                renderToString(
                    <Bold>
                        <Code>test</Code>
                    </Bold>,
                ),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Bold > Pre (Forbidden in Bot API)',
            run: () =>
                renderToString(
                    <Bold>
                        <Pre>code</Pre>
                    </Bold>,
                ),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Link > Time (Forbidden in Bot API)',
            run: () =>
                renderToString(
                    <Link href="https://example.com">
                        <Time unix={1718000000} />
                    </Link>,
                ),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Link > Code (Forbidden in Bot API)',
            run: () =>
                renderToString(
                    <Link href="https://example.com">
                        <Code>test</Code>
                    </Link>,
                ),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Link > Link (Forbidden in Bot API)',
            run: () =>
                renderToString(
                    <Link href="https://a.com">
                        <Link href="https://b.com">link</Link>
                    </Link>,
                ),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Blockquote > Blockquote (Forbidden in Bot API)',
            run: () =>
                renderToString(
                    <Blockquote>
                        <Blockquote>nested quote</Blockquote>
                    </Blockquote>,
                ),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Code > Bold (Forbidden in Bot API)',
            run: () => renderToString(<Code>{(<Bold>bold</Bold>) as any}</Code>),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Pre > Italic (Forbidden in Bot API)',
            run: () =>
                renderToString(
                    <Pre>
                        <Italic>italic</Italic>
                    </Pre>,
                ),
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Partial Overlapping Entities (compileToEntities)',
            run: () => {
                validateEntitiesOverlap([
                    { type: 'bold', offset: 0, length: 10 },
                    { type: 'italic', offset: 5, length: 10 },
                ]);
            },
            expectedErrorType: TelegramNestingError,
        },
        {
            name: 'Prohibited URL Protocol (javascript:)',
            run: () => renderToString(<Link href="javascript:alert(1)">click</Link>),
            expectedErrorType: Error,
        },
        {
            name: 'Unsafe User ID (Precision Overflow)',
            run: () => renderToString(<User id={9007199254740992}>User</User>),
            expectedErrorType: Error,
        },
        {
            name: 'Message Limit Overflow (4097 UTF-16 characters)',
            run: () => {
                const text = 'A'.repeat(4097);
                renderToString(text, { validate: 'message' });
            },
            expectedErrorType: TelegramLimitError,
        },
        {
            name: 'Caption Limit Overflow (1025 UTF-16 characters)',
            run: () => {
                const text = 'A'.repeat(1025);
                renderToString(text, { validate: 'caption' });
            },
            expectedErrorType: TelegramLimitError,
        },
    ];

    for (const tc of testCases) {
        try {
            tc.run();
            exceptionResults.push({
                scenario: tc.name,
                expectedError: tc.expectedErrorType.name,
                passed: false,
                actualMessage: 'Did not throw any error!',
            });
            console.error(`✗ FAILED: ${tc.name} did not throw!`);
        } catch (err: any) {
            const isExpected = err instanceof tc.expectedErrorType;
            exceptionResults.push({
                scenario: tc.name,
                expectedError: tc.expectedErrorType.name,
                passed: isExpected,
                actualMessage: err.message,
            });
            if (isExpected) {
                console.log(
                    `✓ PASSED: ${tc.name} -> caught ${err.constructor.name}: "${err.message.slice(0, 70)}..."`,
                );
            } else {
                console.error(
                    `✗ FAILED: ${tc.name} -> caught unexpected error type ${err.constructor.name}: ${err.message}`,
                );
            }
        }
    }
}
