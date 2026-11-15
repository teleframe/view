import { $ } from 'bun';
import {
    checkFnoxInstalled,
    FNOX_CONFIG,
    FNOX_LOCAL_CONFIG,
    type LocalSecrets,
    readLocalSecrets,
    writeLocalSecrets,
} from './config';

/**
 * Interactive setup wizard for local environment
 */
export async function runSetupWizard(args: string[]): Promise<void> {
    console.log('\n🔒 Telegram Markup — Local Secrets Setup (fnox)');
    console.log('================================================');

    const isInstalled = await checkFnoxInstalled();
    if (!isInstalled) {
        console.error('❌ Error: "fnox" CLI is not found in your PATH.');
        console.error('👉 Install it with: mise use -g fnox  or  cargo install fnox');
        process.exit(1);
    }

    const existing = await readLocalSecrets();

    // 1. Telegram Bot Token
    let botToken = '';
    const tokenFlagIndex = args.indexOf('--token');
    if (tokenFlagIndex !== -1 && args[tokenFlagIndex + 1]) {
        botToken = args[tokenFlagIndex + 1];
    } else {
        const defaultHint = existing.TELEGRAM_BOT_TOKEN
            ? ` [current: ${existing.TELEGRAM_BOT_TOKEN.slice(0, 6)}...${existing.TELEGRAM_BOT_TOKEN.slice(-4)}]`
            : '';
        const input = prompt(`🤖 Enter your local Telegram Bot Token${defaultHint}:`);
        botToken = input?.trim() || existing.TELEGRAM_BOT_TOKEN || '';
    }

    if (!botToken) {
        console.warn('⚠️ Warning: No Telegram Bot Token was provided. You can set it later.');
    }

    // 2. Telegram Test Environment
    let testEnv = '';
    const testEnvFlagIndex = args.indexOf('--test-env');
    if (testEnvFlagIndex !== -1 && args[testEnvFlagIndex + 1]) {
        testEnv = args[testEnvFlagIndex + 1];
    } else {
        const defaultTestEnv = existing.TELEGRAM_TEST_ENV || 'true';
        const input = prompt(
            `🧪 Use Telegram Test Environment? (Y/n) [default: ${defaultTestEnv}]:`,
        );
        if (!input || input.trim() === '') {
            testEnv = defaultTestEnv;
        } else {
            const lower = input.trim().toLowerCase();
            testEnv = lower === 'y' || lower === 'yes' || lower === 'true' ? 'true' : 'false';
        }
    }

    const secrets: LocalSecrets = {
        ...existing,
        TELEGRAM_BOT_TOKEN: botToken,
        TELEGRAM_TEST_ENV: testEnv,
    };

    await writeLocalSecrets(secrets);

    console.log('\n✅ Local configuration saved to fnox.local.toml:');
    console.log(
        `   • TELEGRAM_BOT_TOKEN: ${botToken ? `${botToken.slice(0, 6)}... (length: ${botToken.length})` : '(empty)'}`,
    );
    console.log(`   • TELEGRAM_TEST_ENV:   ${testEnv}`);

    // Verification test
    try {
        const resolvedToken = await $`fnox get TELEGRAM_BOT_TOKEN`.quiet().text();
        const resolvedTest = await $`fnox get TELEGRAM_TEST_ENV`.quiet().text();
        console.log('\n🔎 Verification via fnox:');
        console.log(
            `   ✓ Active token:    ${resolvedToken.trim() ? `${resolvedToken.trim().slice(0, 6)}...` : '(empty)'}`,
        );
        console.log(`   ✓ Active test env: ${resolvedTest.trim()}`);
    } catch (err) {
        console.warn('⚠️ Could not verify with fnox directly:', err);
    }

    console.log('\n🚀 You are ready to develop!');
    console.log('   Run commands with secrets:  fnox exec -- bun run ...');
    console.log('   Check active secrets:       bun run env:status\n');
}

/**
 * Status command: shows active secrets, local overrides, and prod status
 */
export async function runStatus(): Promise<void> {
    console.log('\n📊 Fnox Environment Status');
    console.log('==========================');

    const isInstalled = await checkFnoxInstalled();
    console.log(`• fnox installed:      ${isInstalled ? '✓ Yes' : '✗ No'}`);

    const prodFile = Bun.file(FNOX_CONFIG);
    const hasProd = await prodFile.exists();
    console.log(
        `• fnox.toml (repo):    ${hasProd ? '✓ Present (encrypted with age)' : '✗ Missing'}`,
    );

    const localFile = Bun.file(FNOX_LOCAL_CONFIG);
    const hasLocal = await localFile.exists();
    console.log(
        `• fnox.local.toml:     ${hasLocal ? '✓ Present (local plain overrides)' : '○ Absent (using repo secrets)'}`,
    );

    if (hasProd) {
        const prodContent = await prodFile.text();
        const prodKeysRegex = /([A-Za-z0-9_]+)\s*=\s*\{\s*provider\s*=\s*"([^"]+)"/g;
        const prodSecrets: Record<string, string> = {};
        let m;
        while ((m = prodKeysRegex.exec(prodContent)) !== null) {
            prodSecrets[m[1]] = m[2];
        }
        console.log('\n🔐 Production Secrets (fnox.toml):');
        for (const [k, p] of Object.entries(prodSecrets)) {
            console.log(`   • ${k}: [Encrypted with provider "${p}"]`);
        }
    }

    if (hasLocal) {
        const localSecrets = await readLocalSecrets();
        console.log('\n🏠 Local Plain Overrides (fnox.local.toml):');
        for (const [k, v] of Object.entries(localSecrets)) {
            console.log(`   • ${k}: ${v ? `${v.slice(0, 6)}...${v.slice(-4)}` : '(empty)'}`);
        }
    }

    if (isInstalled) {
        try {
            const token = (await $`fnox get TELEGRAM_BOT_TOKEN`.quiet().text()).trim();
            const testEnv = (await $`fnox get TELEGRAM_TEST_ENV`.quiet().text()).trim();

            console.log('\n⚡ Effective Runtime Values (what fnox exec injects):');
            console.log(
                `   • TELEGRAM_BOT_TOKEN: ${token ? `${token.slice(0, 6)}...${token.slice(-4)}` : '(not set)'}`,
            );
            console.log(`   • TELEGRAM_TEST_ENV:   ${testEnv || '(not set)'}`);
        } catch {
            console.log('   (Could not decrypt or resolve secrets with current key)');
        }
    }
    console.log('');
}

/**
 * Set a secret directly
 */
export async function runSet(args: string[], forceProd: boolean = false): Promise<void> {
    const isProd = forceProd || args.includes('--prod');
    const cleanArgs = args.filter(
        (a) => a !== '--prod' && a !== 'set' && a !== 'set-prod' && a !== 'set:prod',
    );
    const key = cleanArgs[0];
    const value = cleanArgs[1];

    if (!key || !value) {
        console.error('Usage: bun scripts/fnox.ts set <KEY> <VALUE> [--prod]');
        process.exit(1);
    }

    if (isProd) {
        console.log(`🔐 Encrypting ${key} into fnox.toml using age provider...`);
        await $`fnox set -c ${FNOX_CONFIG} -p age ${key} ${value}`;
        console.log(`✓ Secret ${key} successfully encrypted in fnox.toml with age!`);
    } else {
        const existing = await readLocalSecrets();
        existing[key] = value;
        await writeLocalSecrets(existing);
        console.log(`✓ Secret ${key} saved in fnox.local.toml (plain/unencrypted)`);
    }
}
