/**
 * @fileoverview Live animated progress task manager updating messages in-place every second
 * @module examples/src/tasks/progress-live
 */

import type { Context } from 'grammy';
import { getLiveProgressKeyboard } from '../keyboards';
import { renderLiveProgressPage } from '../pages/live-progress';

interface TaskStage {
    progress: number;
    stage: string;
}

const STAGES: TaskStage[] = [
    { progress: 10, stage: 'Connecting to cluster and provisioning node...' },
    { progress: 28, stage: 'Pulling Docker base image and dependencies...' },
    { progress: 48, stage: 'Compiling TypeScript and bundle optimization...' },
    { progress: 68, stage: 'Running unit test suite and health probes...' },
    { progress: 88, stage: 'Routing traffic through ingress gateway...' },
    { progress: 100, stage: 'Deployment successful! Application is live. 🚀' },
];

const activeTasks = new Map<string, { timer: NodeJS.Timeout; isCancelled: boolean }>();

const getTaskKey = (chatId: number | string, messageId: number): string => `${chatId}:${messageId}`;

/**
 * Starts or restarts a live animated progress task on a message
 */
export const startLiveProgressTask = async (
    ctx: Context,
    targetMessageId?: number,
): Promise<void> => {
    const chat = ctx.chat;
    if (!chat) return;

    const chatId = chat.id;

    // If no targetMessageId, send initial message
    let messageId = targetMessageId;
    if (!messageId) {
        const initialHtml = renderLiveProgressPage({
            progress: 0,
            stage: 'Starting live simulation...',
            status: 'running',
            elapsedSeconds: 0,
        });

        const sent = await ctx.reply(initialHtml, {
            parse_mode: 'HTML',
            reply_markup: getLiveProgressKeyboard('running'),
        });
        messageId = sent.message_id;
    }

    const key = getTaskKey(chatId, messageId);

    // Clear existing task if running
    const existing = activeTasks.get(key);
    if (existing) {
        clearInterval(existing.timer);
        existing.isCancelled = true;
        activeTasks.delete(key);
    }

    let stepIndex = 0;
    let elapsed = 0;

    const currentTask = {
        isCancelled: false,
        timer: null as any,
    };

    currentTask.timer = setInterval(async () => {
        if (currentTask.isCancelled) {
            clearInterval(currentTask.timer);
            activeTasks.delete(key);
            return;
        }

        elapsed += 1;
        const currentStage = STAGES[stepIndex];
        const isFinished = stepIndex >= STAGES.length - 1;

        const html = renderLiveProgressPage({
            progress: currentStage.progress,
            stage: currentStage.stage,
            status: isFinished ? 'completed' : 'running',
            elapsedSeconds: elapsed,
        });

        try {
            await ctx.api.editMessageText(chatId, messageId!, html, {
                parse_mode: 'HTML',
                reply_markup: getLiveProgressKeyboard(isFinished ? 'completed' : 'running'),
            });
        } catch (err: any) {
            // Ignore if message wasn't modified or deleted
            if (!err?.message?.includes('message is not modified')) {
                console.warn('⚠️ Could not update live progress message:', err.message);
            }
        }

        if (isFinished) {
            clearInterval(currentTask.timer);
            activeTasks.delete(key);
            return;
        }

        stepIndex += 1;
    }, 1000);

    activeTasks.set(key, currentTask);
};

/**
 * Cancels a running live progress simulation
 */
export const cancelLiveProgressTask = async (ctx: Context, messageId: number): Promise<void> => {
    const chat = ctx.chat;
    if (!chat) return;

    const key = getTaskKey(chat.id, messageId);
    const task = activeTasks.get(key);
    if (task) {
        task.isCancelled = true;
        clearInterval(task.timer);
        activeTasks.delete(key);
    }

    const html = renderLiveProgressPage({
        progress: 50,
        stage: 'Task aborted by operator.',
        status: 'cancelled',
        elapsedSeconds: 0,
    });

    try {
        await ctx.api.editMessageText(chat.id, messageId, html, {
            parse_mode: 'HTML',
            reply_markup: getLiveProgressKeyboard('cancelled'),
        });
    } catch (err: any) {
        console.warn('⚠️ Error cancelling task:', err.message);
    }
};
