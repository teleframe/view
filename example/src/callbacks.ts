/**
 * @fileoverview Interactive navigation callback query routing
 * @module examples/src/callbacks
 */

import type { Bot } from 'grammy';
import { env } from './env';
import { getMenuKeyboard } from './keyboards';
import {
    renderCodePage,
    renderDatesPage,
    renderEntitiesPage,
    renderFunctionalPage,
    renderLimitsPage,
    renderListsPage,
    renderManifestoPage,
    renderProfilePage,
    renderRefreshPage,
    renderSafetyPage,
    renderStartPage,
    renderTypographyPage,
    renderWidgetsPage,
} from './pages';
import { cancelLiveProgressTask, startLiveProgressTask } from './tasks';

/**
 * Registers all interactive callbackQuery handlers onto the bot instance
 */
export const registerCallbacks = (bot: Bot): void => {
    bot.callbackQuery('page_home', async (ctx) => {
        const html = renderStartPage({
            userId: ctx.from?.id ?? 0,
            firstName: ctx.from?.first_name ?? 'Friend',
            isForum: Boolean(ctx.chat?.type === 'supergroup' && ctx.chat?.is_forum),
        });
        await ctx.editMessageText(html, { parse_mode: 'HTML', reply_markup: getMenuKeyboard() });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_profile', async (ctx) => {
        const html = renderProfilePage({
            userId: ctx.from?.id ?? 0,
            firstName: ctx.from?.first_name ?? 'Friend',
            username: ctx.from?.username,
        });
        await ctx.editMessageText(html, { parse_mode: 'HTML', reply_markup: getMenuKeyboard() });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_live_progress', async (ctx) => {
        const messageId = ctx.callbackQuery.message?.message_id;
        await ctx.answerCallbackQuery({ text: 'Starting live task simulation...' });
        await startLiveProgressTask(ctx, messageId);
    });

    bot.callbackQuery('task_restart', async (ctx) => {
        const messageId = ctx.callbackQuery.message?.message_id;
        await ctx.answerCallbackQuery({ text: 'Restarting task simulation...' });
        await startLiveProgressTask(ctx, messageId);
    });

    bot.callbackQuery('task_cancel', async (ctx) => {
        const messageId = ctx.callbackQuery.message?.message_id;
        if (messageId) {
            await cancelLiveProgressTask(ctx, messageId);
        }
        await ctx.answerCallbackQuery({ text: 'Task cancelled' });
    });

    bot.callbackQuery('page_typography', async (ctx) => {
        await ctx.editMessageText(renderTypographyPage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_code', async (ctx) => {
        await ctx.editMessageText(renderCodePage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_lists', async (ctx) => {
        await ctx.editMessageText(renderListsPage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_widgets', async (ctx) => {
        const { text, entities } = renderWidgetsPage();
        await ctx.editMessageText(text, {
            entities,
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_dates', async (ctx) => {
        await ctx.editMessageText(renderDatesPage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_entities', async (ctx) => {
        await ctx.editMessageText(renderEntitiesPage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_safety', async (ctx) => {
        await ctx.editMessageText(renderSafetyPage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_limits', async (ctx) => {
        await ctx.editMessageText(renderLimitsPage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_functional', async (ctx) => {
        const html = renderFunctionalPage({
            userId: ctx.from?.id ?? 0,
            firstName: ctx.from?.first_name ?? 'Friend',
        });
        await ctx.editMessageText(html, {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_manifesto', async (ctx) => {
        await ctx.editMessageText(renderManifestoPage(), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery();
    });

    bot.callbackQuery('page_refresh', async (ctx) => {
        await ctx.editMessageText(renderRefreshPage({ isTestEnv: env.isTestEnv }), {
            parse_mode: 'HTML',
            reply_markup: getMenuKeyboard(),
        });
        await ctx.answerCallbackQuery({ text: 'Screen refreshed live!' });
    });
};

export default registerCallbacks;
