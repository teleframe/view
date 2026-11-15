/**
 * @fileoverview Forum topic creation, state persistence, and retrieval
 * @module examples/src/topics/manager
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { Context } from 'grammy';
import type { ChatForumTopics, ForumTopicsState, TopicCategory } from './types';

export type TopicIconColor = 0x6fb9f0 | 0xffd67e | 0xcb86db | 0x8eee98 | 0xff93b2 | 0xfb6f5f;

/**
 * Metadata specification for each managed forum topic
 */
export const TOPIC_SPECS: Record<
    TopicCategory,
    { name: string; iconColor: TopicIconColor; description: string }
> = {
    native: {
        name: 'Native Components',
        iconColor: 0x6fb9f0,
        description: 'Zero-runtime JSX native text formatting, lists, and progress bars',
    },
    'rich-text': {
        name: 'Rich Text Components',
        iconColor: 0xffd67e,
        description: 'Extended rich message layout engine with multi-card carousels',
    },
    widget: {
        name: 'Interactive Widgets',
        iconColor: 0xcb86db,
        description: 'Stateful interactive widgets, modals, form inputs, and pagination',
    },
    telegraph: {
        name: 'Telegraph Articles',
        iconColor: 0x8eee98,
        description: 'Long-form instant-view article publishing on telegra.ph',
    },
};

const STATE_FILE = join(import.meta.dir, '../../data/topics.json');

const loadState = (): ForumTopicsState => {
    try {
        if (existsSync(STATE_FILE)) {
            const raw = readFileSync(STATE_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.warn('⚠️ Could not load forum topics state:', err);
    }
    return {};
};

const saveState = (data: ForumTopicsState): void => {
    try {
        const dir = dirname(STATE_FILE);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
        console.error('❌ Failed to persist forum topics state:', err);
    }
};

const state: ForumTopicsState = loadState();

/**
 * Renames an existing topic in a forum supergroup
 */
export const renameTopic = async (
    ctx: Context,
    threadId: number,
    name: string = 'Native Components',
): Promise<boolean> => {
    try {
        if (!ctx.chat) return false;
        await ctx.api.editForumTopic(ctx.chat.id, threadId, { name });
        console.log(`✅ Renamed topic ${threadId} to "${name}"`);
        return true;
    } catch (err: any) {
        console.warn(`⚠️ Could not rename topic ${threadId}:`, err?.message ?? err);
        return false;
    }
};

/**
 * Ensures all standard forum topics exist in a forum supergroup.
 * Creates missing topics via Bot API `createForumTopic` and saves thread IDs.
 */
export const ensureForumTopics = async (
    ctx: Context,
): Promise<{ isForum: boolean; topics: ChatForumTopics; newCreated: TopicCategory[] }> => {
    const chat = ctx.chat;
    if (!chat || chat.type !== 'supergroup') {
        return { isForum: false, topics: {}, newCreated: [] };
    }

    const currentThreadId =
        ctx.message?.message_thread_id ?? (ctx.callbackQuery?.message as any)?.message_thread_id;

    const isForum = Boolean(
        chat.is_forum || ctx.message?.is_topic_message || currentThreadId !== undefined,
    );

    if (!isForum) {
        return { isForum: false, topics: {}, newCreated: [] };
    }

    const chatId = String(chat.id);
    const chatTopics: ChatForumTopics = state[chatId] ?? {};
    const newCreated: TopicCategory[] = [];

    // If invoked inside an existing thread, rename it to Native Components and bind
    if (currentThreadId && (!chatTopics.native || chatTopics.native.threadId === currentThreadId)) {
        await renameTopic(ctx, currentThreadId, TOPIC_SPECS.native.name);
        chatTopics.native = {
            threadId: currentThreadId,
            name: TOPIC_SPECS.native.name,
        };
    }

    const categories = Object.keys(TOPIC_SPECS) as TopicCategory[];

    for (const category of categories) {
        if (chatTopics[category]?.threadId) {
            continue;
        }

        const spec = TOPIC_SPECS[category];
        try {
            const topic = await ctx.api.createForumTopic(chat.id, spec.name, {
                icon_color: spec.iconColor,
            });

            chatTopics[category] = {
                threadId: topic.message_thread_id,
                name: spec.name,
            };
            newCreated.push(category);
            console.log(`✅ Created topic "${spec.name}" (thread ID: ${topic.message_thread_id})`);
        } catch (err: any) {
            console.error(`❌ Failed to create topic "${spec.name}":`, err?.message ?? err);
        }
    }

    state[chatId] = chatTopics;
    saveState(state);

    return { isForum: true, topics: chatTopics, newCreated };
};

/**
 * Retrieves thread info for a specific category in a chat
 */
export const getTopic = (
    chatId: number | string,
    category: TopicCategory,
): ChatForumTopics[TopicCategory] => {
    return state[String(chatId)]?.[category];
};
