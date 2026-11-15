/**
 * @fileoverview Live telegram message sending runner with flood control
 * @module example/live/runner
 */

import { bot } from '../bot';
import { render, renderToString, stripTelegramHtml } from '@teleframe/view/native';
import type { LiveSendReport } from './types';

export const TARGET_CHAT_ID = 2202303388;
export const liveReports: LiveSendReport[] = [];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeWithFloodControl<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        await sleep(2000);
        try {
            return await operation();
        } catch (err: any) {
            const retryAfter = err.parameters?.retry_after ?? err.retry_after;
            if (retryAfter !== undefined && attempt < maxRetries) {
                const waitSec = Number(retryAfter) + 2;
                console.log(
                    `⏳ Telegram Flood Control (retry_after: ${retryAfter}s). Backing off for ${waitSec}s...`,
                );
                await sleep(waitSec * 1000);
                continue;
            }
            throw err;
        }
    }
    throw new Error('Flood control max retries exceeded');
}

export async function sendHtmlLive(
    title: string,
    jsxTree: any,
    validate?: 'message' | 'caption',
): Promise<void> {
    try {
        const html = renderToString(jsxTree, validate ? { validate } : undefined);
        const cleanLength = stripTelegramHtml(html).length;
        const res = await executeWithFloodControl(() =>
            bot.api.sendMessage(TARGET_CHAT_ID, html, {
                parse_mode: 'HTML',
            }),
        );
        liveReports.push({
            title,
            mode: 'HTML',
            messageId: res.message_id,
            success: true,
            entitiesCount: res.entities?.length ?? 0,
            textLength: cleanLength,
        });
        console.log(
            `✓ [LIVE HTML] "${title}" -> msg_id: ${res.message_id} (len: ${cleanLength}, entities: ${res.entities?.length ?? 0})`,
        );
    } catch (err: any) {
        liveReports.push({
            title,
            mode: 'HTML',
            success: false,
            error: err.description || err.message,
        });
        console.error(`✗ [LIVE HTML] "${title}" -> ERROR:`, err.description || err.message);
    }
}

export async function sendEntitiesLive(
    title: string,
    jsxTree: any,
    validate?: 'message' | 'caption',
): Promise<void> {
    try {
        const { text, entities } = render(jsxTree, validate ? { validate } : undefined);
        const res = await executeWithFloodControl(() =>
            bot.api.sendMessage(TARGET_CHAT_ID, text, {
                entities,
            }),
        );
        liveReports.push({
            title,
            mode: 'ENTITIES',
            messageId: res.message_id,
            success: true,
            entitiesCount: res.entities?.length ?? 0,
            textLength: text.length,
        });
        console.log(
            `✓ [LIVE ENTITIES] "${title}" -> msg_id: ${res.message_id} (len: ${text.length}, entities: ${res.entities?.length ?? 0})`,
        );
    } catch (err: any) {
        liveReports.push({
            title,
            mode: 'ENTITIES',
            success: false,
            error: err.description || err.message,
        });
        console.error(`✗ [LIVE ENTITIES] "${title}" -> ERROR:`, err.description || err.message);
    }
}
