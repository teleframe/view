/**
 * Environment configuration for the example bot
 * Injected automatically via fnox or environment variables
 */

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error('\n❌ Error: TELEGRAM_BOT_TOKEN is not defined in the environment!');
    console.error('👉 Start the bot with fnox secrets:');
    console.error('   fnox exec -- bun run dev');
    console.error('👉 Or configure your local token:');
    console.error('   bun run env:setup\n');
    process.exit(1);
}

export const env = {
    token,
    isTestEnv: process.env.TELEGRAM_TEST_ENV === 'true',
    nodeEnv: process.env.NODE_ENV || 'development',
} as const;

export default env;
