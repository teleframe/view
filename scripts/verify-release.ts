#!/usr/bin/env bun
/**
 * @fileoverview Automated Release Verification Pipeline
 * Runs type checks, test suite, production build, and verifies npm tarball
 * packaging, clean installation, and ESM runtime imports for @teleframe/view.
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

    // 0. Version Consistency & Tag Verification
    await runStep('Verifying manifest version consistency', async () => {
        const pkg = await Bun.file(`${ROOT_DIR}/package.json`).json();
        const deno = await Bun.file(`${ROOT_DIR}/deno.json`).json();
        const nativePkg = await Bun.file(`${ROOT_DIR}/packages/native/package.json`).json();

        if (pkg.version !== deno.version) {
            throw new Error(
                `Version mismatch: package.json (${pkg.version}) !== deno.json (${deno.version})`,
            );
        }
        if (pkg.version !== nativePkg.version) {
            throw new Error(
                `Version mismatch: package.json (${pkg.version}) !== packages/native (${nativePkg.version})`,
            );
        }

        const manifestFile = Bun.file(`${ROOT_DIR}/.release-please-manifest.json`);
        if (await manifestFile.exists()) {
            const manifest = await manifestFile.json();
            if (manifest['.'] && manifest['.'] !== pkg.version) {
                throw new Error(
                    `Version mismatch: package.json (${pkg.version}) !== .release-please-manifest.json (${manifest['.']})`,
                );
            }
        }

        const tag = process.env.GITHUB_REF_NAME;
        if (tag && tag.startsWith('v')) {
            const expected = tag.slice(1);
            if (pkg.version !== expected) {
                throw new Error(
                    `Tag version mismatch: git tag ${tag} expects ${expected}, but package.json has ${pkg.version}`,
                );
            }
        }
    });

    // 1. Code Formatting
    await runStep('Checking code formatting (bun fmt --check)', async () => {
        await $`bun fmt --check`.quiet();
    });

    // 2. TypeScript Static Analysis (Root, Packages & Example)
    await runStep('Type checking workspace (tsc & deno check)', async () => {
        await $`bun run check`.quiet();
        await $`bun run --cwd example check`.quiet();
        await $`deno task check`.quiet();
    });

    // 3. Unit & Integration Test Suite
    await runStep('Running test suite (bun test)', async () => {
        await $`bun test`.quiet();
    });

    // 4. Production Build
    await runStep('Building production artifacts (bun run build)', async () => {
        await $`bun run build`.quiet();
    });

    // 5. Package & Test @teleframe/view npm tarball (root & subpaths)
    await runStep('Verifying @teleframe/view npm tarball installation', async () => {
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
import { Bold, Italic, renderToString, Native } from "@teleframe/view";
import { bold, italic, render } from "@teleframe/view/native";
import { jsx } from "@teleframe/view/jsx-runtime";

// 1. Root JSX component rendering
const html = renderToString(Bold({ children: ["Hello ", Italic({ children: "World" })] }));
if (html !== "<b>Hello <i>World</i></b>") throw new Error("Unexpected root HTML: " + html);

// 2. Namespaced Native export
const nsHtml = Native.renderToString(Native.bold("Namespaced works!"));
if (nsHtml !== "<b>Namespaced works!</b>") throw new Error("Unexpected Native HTML: " + nsHtml);

// 3. Subpath native functional builder & entity compilation
const { text, entities } = render(bold(["Subpath ", italic("native"), " works!"]));
if (text !== "Subpath native works!" || entities.length !== 2) {
    throw new Error("Unexpected native entities: " + JSON.stringify(entities));
}

// 4. Subpath jsx-runtime
if (typeof jsx !== "function") throw new Error("jsx runtime export missing");
`;
            await Bun.write(`${tmpDir}/test.mjs`, testScript);
            await $`node test.mjs`.cwd(tmpDir).quiet();
        } finally {
            await $`rm -rf ${tmpDir}`.quiet();
            await $`rm -f ${tarballPath}`.quiet();
        }
    });

    // 6. Verify Deno execution & test suite
    await runStep('Verifying Deno runtime compatibility (deno test)', async () => {
        await $`deno test tests/deno.test.tsx`.quiet();
    });

    console.log('\n===========================================');
    console.log('✨ ALL RELEASE CHECKS PASSED SUCCESSFULLY!');
    console.log('===========================================\n');
}

verifyRelease().catch((err) => {
    console.error('Fatal release verification error:', err);
    process.exit(1);
});
