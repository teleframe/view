/**
 * @fileoverview Main entry point and bot controller with forum topics & interactive markup
 * @module examples/src/index
 */

import type { Context } from 'grammy';
import { bot } from './bot';
import { registerCallbacks } from './callbacks';
import { env } from './env';
import { getMenuKeyboard } from './keyboards';
import {
    renderCodePage,
    renderDatesPage,
    renderEntitiesPage,
    renderLimitsPage,
    renderListsPage,
    renderManifestoPage,
    renderProfilePage,
    renderSafetyPage,
    renderStartPage,
    renderTopicHubPage,
    renderTypographyPage,
    renderWidgetsPage,
} from './pages';
import { startLiveProgressTask } from './tasks';
import { TOPIC_SPECS, ensureForumTopics, renameTopic } from './topics';
import type { ChatForumTopics, TopicCategory } from './topics/types';

const initializeNewTopics = async (
    ctx: Context,
    topics: ChatForumTopics,
    newCreated: TopicCategory[],
): Promise<void> => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    for (const category of newCreated) {
        const topic = topics[category];
        if (!topic?.threadId) continue;

        const spec = TOPIC_SPECS[category];
        const html = renderTopicHubPage({
            category,
            topicName: spec.name,
            description: spec.description,
        });

        await ctx.api.sendMessage(chatId, html, {
            message_thread_id: topic.threadId,
            parse_mode: 'HTML',
            reply_markup: category === 'native' ? getMenuKeyboard() : undefined,
        });
    }
};

// -----------------------------------------------------------------------------
// 1. Bot Commands
// -----------------------------------------------------------------------------

bot.command(['start', 'setup', 'help'], async (ctx) => {
    const userId = ctx.from?.id ?? 0;
    const firstName = ctx.from?.first_name ?? 'Friend';
    const currentThreadId = ctx.message?.message_thread_id;
    const isForum = Boolean(
        ctx.chat?.type === 'supergroup' &&
        (ctx.chat?.is_forum || ctx.message?.is_topic_message || currentThreadId !== undefined),
    );

    if (isForum) {
        const { topics, newCreated } = await ensureForumTopics(ctx);
        await initializeNewTopics(ctx, topics, newCreated);
    }

    const html = renderStartPage({ userId, firstName, isForum });
    await ctx.reply(html, {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command('rename', async (ctx) => {
    const threadId = ctx.message?.message_thread_id;
    if (threadId) {
        const name = ctx.match?.trim() || 'Native Components';
        await renameTopic(ctx, threadId, name);
        await ctx.reply(`✅ Topic renamed to <b>${name}</b>`, { parse_mode: 'HTML' });
    }
});

bot.command('profile', async (ctx) => {
    const html = renderProfilePage({
        userId: ctx.from?.id ?? 0,
        firstName: ctx.from?.first_name ?? 'Friend',
        username: ctx.from?.username,
    });
    await ctx.reply(html, { parse_mode: 'HTML', reply_markup: getMenuKeyboard() });
});

bot.command('progress', async (ctx) => {
    await startLiveProgressTask(ctx);
});

bot.command(['demo', 'typography'], async (ctx) => {
    await ctx.reply(renderTypographyPage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command('code', async (ctx) => {
    await ctx.reply(renderCodePage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command('lists', async (ctx) => {
    await ctx.reply(renderListsPage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command(['widgets', 'bars'], async (ctx) => {
    const { text, entities } = renderWidgetsPage();
    await ctx.reply(text, {
        entities,
        reply_markup: getMenuKeyboard(),
    });
});

bot.command(['dates', 'time'], async (ctx) => {
    await ctx.reply(renderDatesPage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command('entities', async (ctx) => {
    await ctx.reply(renderEntitiesPage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command('safety', async (ctx) => {
    await ctx.reply(renderSafetyPage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command('limits', async (ctx) => {
    await ctx.reply(renderLimitsPage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

bot.command('manifesto', async (ctx) => {
    await ctx.reply(renderManifestoPage(), {
        parse_mode: 'HTML',
        reply_markup: getMenuKeyboard(),
    });
});

// -----------------------------------------------------------------------------
// 2. Interactive Navigation Callbacks
// -----------------------------------------------------------------------------

registerCallbacks(bot);

// -----------------------------------------------------------------------------
// 3. Bot Polling Lifecycle
// -----------------------------------------------------------------------------

console.log(`🤖 Starting bot in ${env.isTestEnv ? 'TEST' : 'PRODUCTION'} environment...`);

bot.start({
    onStart: (info) => {
        console.log(`✨ Bot started as @${info.username} (ID: ${info.id})`);
        console.log('👉 Send /start in DM or add bot to a Forum Supergroup to test topics!');
    },
});
