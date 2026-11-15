#!/usr/bin/env bun
/**
 * @fileoverview Automated Release Verification Pipeline
 * Runs type checks, test suite, production build, and verifies npm tarball
 * packaging, clean installation, and ESM runtime imports.
 */

import { $ } from 'bun';

const ROOT_DIR = process.cwd();

async function runStep(name: string, fn: () => Promise<void>) {
    const start = performance.now();
    process.stdout.write(`⏳ ${name}... `);
    try {
        await fn();
        const duration = (performance.now() - start).toFixed(0);
        console.log(`\x1b[32m✓ PASSED\x1b[0m (${duration}ms)`);
    } catch (err: any) {
        console.log(`\x1b[31m✗ FAILED\x1b[0m`);
        console.error(err);
        process.exit(1);
    }
}

async function verifyRelease() {
    console.log('\n🚀 Starting Release Verification Pipeline');
    console.log('===========================================\n');

    // 1. Code Formatting
    await runStep('Checking code formatting (bun fmt --check)', async () => {
        await $`bun fmt --check`.quiet();
    });

    // 2. TypeScript Static Analysis (Root & Example)
    await runStep('Type checking workspace (tsc --noEmit)', async () => {
        await $`bun run check`.quiet();
        await $`bun run --cwd example check`.quiet();
    });

    // 3. Unit & Integration Test Suite
    await runStep('Running test suite (bun test)', async () => {
        await $`bun test`.quiet();
    });

    // 4. Production Build
    await runStep('Building production artifacts (bun run build)', async () => {
        await $`bun run build`.quiet();
    });

    // 5. Package & Test @telegram-markup/native tarball
    await runStep('Verifying @telegram-markup/native npm tarball installation', async () => {
        const pkgDir = `${ROOT_DIR}/packages/native`;
        const packRes = await $`npm pack`.cwd(pkgDir).quiet().text();
        const tarballName = packRes.trim().split('\n').pop()?.trim();
        if (!tarballName) throw new Error('Could not determine tarball name from npm pack');
        const tarballPath = `${pkgDir}/${tarballName}`;

        const tmpDir = `/tmp/test-pkg-install-${Date.now()}`;
        await $`mkdir -p ${tmpDir}`.quiet();

        try {
            await $`npm init -y`.cwd(tmpDir).quiet();
            await $`npm install ${tarballPath}`.cwd(tmpDir).quiet();

            // Run verification script in Node.js
            const testScript = `
import { Bold, Italic, Link, renderToString, render, escapeHtml, bold, italic } from "@telegram-markup/native";

// 1. JSX / component rendering
const html = renderToString(Bold({ children: ["Hello ", Italic({ children: "World" })] }));
if (html !== "<b>Hello <i>World</i></b>") throw new Error("Unexpected HTML output: " + html);

// 2. Functional builder
const funcHtml = renderToString(bold(["Text ", italic("italic")]));
if (funcHtml !== "<b>Text <i>italic</i></b>") throw new Error("Unexpected functional HTML: " + funcHtml);

// 3. Entity compilation
const { text, entities } = render(bold(["Hello ", italic("World")]));
if (text !== "Hello World" || entities.length !== 2) throw new Error("Unexpected entities: " + JSON.stringify(entities));

// 4. Sanitizer
if (escapeHtml("<script>") !== "&lt;script&gt;") throw new Error("Unexpected escapeHtml output");
`;
            await Bun.write(`${tmpDir}/test.mjs`, testScript);
            await $`node test.mjs`.cwd(tmpDir).quiet();
        } finally {
            await $`rm -rf ${tmpDir}`.quiet();
            await $`rm -f ${tarballPath}`.quiet();
        }
    });

    // 6. Package & Test root telegram-markup umbrella tarball
    await runStep('Verifying telegram-markup (root) npm tarball installation', async () => {
        const packRes = await $`npm pack`.cwd(ROOT_DIR).quiet().text();
        const tarballName = packRes.trim().split('\n').pop()?.trim();
        if (!tarballName) throw new Error('Could not determine root tarball name from npm pack');
        const tarballPath = `${ROOT_DIR}/${tarballName}`;

        const tmpDir = `/tmp/test-root-install-${Date.now()}`;
        await $`mkdir -p ${tmpDir}`.quiet();

        try {
            await $`npm init -y`.cwd(tmpDir).quiet();
            await $`npm install ${tarballPath}`.cwd(tmpDir).quiet();

            const testScript = `
import { Bold, renderToString } from "telegram-markup";
import { bold, render } from "telegram-markup/native";

const html = renderToString(Bold({ children: "Root package works!" }));
if (html !== "<b>Root package works!</b>") throw new Error("Unexpected root HTML: " + html);

const { text, entities } = render(bold("Subpath native works!"));
if (text !== "Subpath native works!" || entities.length !== 1) throw new Error("Unexpected native entities: " + JSON.stringify(entities));
`;
            await Bun.write(`${tmpDir}/test.mjs`, testScript);
            await $`node test.mjs`.cwd(tmpDir).quiet();
        } finally {
            await $`rm -rf ${tmpDir}`.quiet();
            await $`rm -f ${tarballPath}`.quiet();
        }
    });

    console.log('\n===========================================');
    console.log('✨ ALL RELEASE CHECKS PASSED SUCCESSFULLY!');
    console.log('===========================================\n');
}

verifyRelease().catch((err) => {
    console.error('Fatal release verification error:', err);
    process.exit(1);
});
