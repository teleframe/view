import { $ } from 'bun';

export const ROOT_DIR = process.cwd();
export const FNOX_CONFIG = `${ROOT_DIR}/fnox.toml`;
export const FNOX_LOCAL_CONFIG = `${ROOT_DIR}/fnox.local.toml`;

export interface LocalSecrets {
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_TEST_ENV?: string;
    [key: string]: string | undefined;
}

/**
 * Checks if fnox CLI is installed and available
 */
export async function checkFnoxInstalled(): Promise<boolean> {
    try {
        const proc = await $`fnox --version`.quiet();
        return proc.exitCode === 0;
    } catch {
        return false;
    }
}

/**
 * Reads existing plain secrets from fnox.local.toml if it exists
 */
export async function readLocalSecrets(): Promise<LocalSecrets> {
    const file = Bun.file(FNOX_LOCAL_CONFIG);
    if (!(await file.exists())) {
        return {};
    }

    const content = await file.text();
    const secrets: LocalSecrets = {};

    const regex =
        /([A-Za-z0-9_]+)\s*=\s*(?:\{\s*provider\s*=\s*"plain",\s*value\s*=\s*"([^"]*)"\s*\}|"([^"]*)")/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        const value = match[2] ?? match[3];
        secrets[key] = value;
    }

    return secrets;
}

/**
 * Writes secrets to fnox.local.toml in plain text
 */
export async function writeLocalSecrets(secrets: LocalSecrets): Promise<void> {
    let content = `# ==============================================================================
# Local Development Secrets (UNENCRYPTED / PLAIN)
# This file overrides fnox.toml for local development.
# IMPORTANT: Never commit this file! It is ignored by git.
# ==============================================================================

[secrets]
`;

    for (const [key, value] of Object.entries(secrets)) {
        if (value !== undefined) {
            const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            content += `${key} = { provider = "plain", value = "${escaped}" }\n`;
        }
    }

    await Bun.write(FNOX_LOCAL_CONFIG, content);
}

/**
 * Show production secrets decrypted from fnox.toml (ignoring fnox.local.toml)
 */
export async function runShowProd(): Promise<void> {
    console.log('\n🔐 Production Secrets (decrypted from fnox.toml via age):');
    console.log('==========================================================');
    try {
        const output = await $`fnox export -c <(cat ${FNOX_CONFIG})`.text();
        console.log(output.trim());
    } catch {
        const tmp = `/tmp/fnox-prod-view-${Date.now()}.toml`;
        await Bun.write(tmp, await Bun.file(FNOX_CONFIG).text());
        try {
            const output = await $`fnox export -c ${tmp}`.text();
            console.log(output.trim());
        } finally {
            await $`rm -f ${tmp}`.quiet();
        }
    }
    console.log('');
}
