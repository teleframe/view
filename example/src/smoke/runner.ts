/**
 * @fileoverview Smoke test execution runner and reporting utilities
 * @module example/smoke/runner
 */

import { bot } from '../bot';
import { render, renderToString } from '@teleframe/view/native';

export const TARGET_CHAT_ID = 2202303388;

export interface TestReport {
    name: string;
    mode: 'HTML' | 'ENTITIES';
    messageId?: number;
    success: boolean;
    error?: string;
    entitiesCount?: number;
}

export const reports: TestReport[] = [];

export async function sendHtmlTest(name: string, jsxTree: any): Promise<void> {
    try {
        const html = renderToString(jsxTree);
        const res = await bot.api.sendMessage(TARGET_CHAT_ID, html, {
            parse_mode: 'HTML',
        });
        reports.push({
            name,
            mode: 'HTML',
            messageId: res.message_id,
            success: true,
            entitiesCount: res.entities?.length ?? 0,
        });
        console.log(`✓ [HTML] ${name} -> msg_id: ${res.message_id}`);
    } catch (err: any) {
        reports.push({
            name,
            mode: 'HTML',
            success: false,
            error: err.description || err.message,
        });
        console.error(`✗ [HTML] ${name} -> ERROR:`, err.description || err.message);
    }
}

export async function sendEntityTest(name: string, jsxTree: any): Promise<void> {
    try {
        const { text, entities } = render(jsxTree);
        const res = await bot.api.sendMessage(TARGET_CHAT_ID, text, {
            entities,
        });
        reports.push({
            name,
            mode: 'ENTITIES',
            messageId: res.message_id,
            success: true,
            entitiesCount: res.entities?.length ?? 0,
        });
        console.log(`✓ [ENTITIES] ${name} -> msg_id: ${res.message_id}`);
    } catch (err: any) {
        reports.push({
            name,
            mode: 'ENTITIES',
            success: false,
            error: err.description || err.message,
        });
        console.error(`✗ [ENTITIES] ${name} -> ERROR:`, err.description || err.message);
    }
}
