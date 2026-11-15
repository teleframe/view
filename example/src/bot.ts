import { Bot } from 'grammy';
import { env } from './env';

/**
 * Initializes grammY Bot instance configured with environment options
 */
export const bot = new Bot(env.token, {
    client: {
        environment: env.isTestEnv ? 'test' : 'prod',
    },
});

export default bot;
