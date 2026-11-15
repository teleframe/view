/**
 * @fileoverview Interactive Telegram inline keyboard menus for example bot navigation
 * @module examples/src/keyboards
 */

import { InlineKeyboard } from 'grammy';

/**
 * Constructs the main interactive navigation keyboard.
 * Each button emits a callback_data payload routed in `src/callbacks.ts`.
 */
export const getMenuKeyboard = (): InlineKeyboard => {
    return new InlineKeyboard()
        .text('🎨 Typography', 'page_typography')
        .text('💻 Code', 'page_code')
        .row()
        .text('📋 Lists & Indent', 'page_lists')
        .text('📊 Widgets & Bars', 'page_widgets')
        .row()
        .text('🕒 Dates & Time', 'page_dates')
        .text('🎯 Entities Pipeline', 'page_entities')
        .row()
        .text('🛡️ Safety & Nesting', 'page_safety')
        .text('📏 Limits & Preflight', 'page_limits')
        .row()
        .text('⚡ Zero-JSX Builder', 'page_functional')
        .text('👤 User Profile', 'page_profile')
        .row()
        .text('⏳ Live Progress', 'page_live_progress')
        .text('📖 Manifesto', 'page_manifesto')
        .row()
        .text('🔄 Refresh', 'page_refresh')
        .text('🏠 Home Hub', 'page_home');
};

/**
 * Controls for the live animated progress task
 */
export const getLiveProgressKeyboard = (
    status: 'running' | 'completed' | 'cancelled',
): InlineKeyboard => {
    const keyboard = new InlineKeyboard();

    if (status === 'running') {
        return keyboard.text('⏹ Cancel Task', 'task_cancel');
    }

    return keyboard
        .text('🔄 Run Again', 'task_restart')
        .text('📊 Widgets & Bars', 'page_widgets')
        .row()
        .text('🏠 Home Hub', 'page_home');
};

export default getMenuKeyboard;
