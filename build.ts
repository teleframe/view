#!/usr/bin/env bun
/**
 * @fileoverview Monorepo build orchestrator (ES6 / Bun)
 * Handles bundling, target outputs, declarations, and package mirroring.
 */

import { $ } from 'bun';
import { generateDeclarations } from './scripts/build/declarations';
import { parseOptions } from './scripts/build/options';
import { discoverPackages } from './scripts/build/packages';

const ROOT_DIR = import.meta.dir;
const DIST_DIR = `${ROOT_DIR}/dist`;
const SRC_DIR = `${ROOT_DIR}/src`;
const EXTERNAL = ['react', 'react/*', 'react/jsx-runtime'];

async function build() {
    const options = parseOptions();
    const start = performance.now();
    const modeLabel = options.isProd ? '\x1b[32mproduction\x1b[0m' : '\x1b[33mdevelopment\x1b[0m';
    const minifyLabel = options.minify ? 'enabled' : 'disabled';
    const typesLabel = options.emitTypes ? 'enabled' : 'disabled';

    console.log(
        `⚡ Starting build [mode: ${modeLabel}, minify: ${minifyLabel}, types: ${typesLabel}]...`,
    );

    // 1. Clean dist/
    await $`rm -rf ${DIST_DIR}`.quiet();
    await $`mkdir -p ${DIST_DIR}`.quiet();

    const packages = await discoverPackages(ROOT_DIR);
    const define: Record<string, string> = {
        'process.env.NODE_ENV': options.isProd ? '"production"' : '"development"',
    };

    // 2. Build root entrypoints (src/index.ts, src/jsx-runtime.ts, src/jsx-dev-runtime.ts)
    const rootFiles = ['index', 'jsx-runtime', 'jsx-dev-runtime'];
    for (const file of rootFiles) {
        const entry = `${SRC_DIR}/${file}.ts`;
        if (await Bun.file(entry).exists()) {
            await Bun.build({
                entrypoints: [entry],
                outdir: DIST_DIR,
                naming: `${file}.js`,
                target: 'node',
                format: 'esm',
                external: EXTERNAL,
                define,
                minify: options.minify,
            });

            await Bun.build({
                entrypoints: [entry],
                outdir: `${DIST_DIR}/bun`,
                naming: `${file}.js`,
                target: 'bun',
                format: 'esm',
                external: EXTERNAL,
                define,
                minify: options.minify,
            });
        }
    }

    // 3. Build discovered modules and all their sub-entrypoints
    for (const pkg of packages) {
        for (const entry of pkg.entries) {
            await Bun.build({
                entrypoints: [entry.sourceFile],
                outdir: `${DIST_DIR}/${pkg.name}`,
                naming: `${entry.subpath}.js`,
                target: 'node',
                format: 'esm',
                external: EXTERNAL,
                define,
                minify: options.minify,
            });

            await Bun.build({
                entrypoints: [entry.sourceFile],
                outdir: `${DIST_DIR}/bun/${pkg.name}`,
                naming: `${entry.subpath}.js`,
                target: 'bun',
                format: 'esm',
                external: EXTERNAL,
                define,
                minify: options.minify,
            });
        }
    }

    // 4. Generate TypeScript declarations
    if (options.emitTypes) {
        await generateDeclarations(ROOT_DIR, DIST_DIR, packages);
    }

    // 5. Mirror build artifacts into each module's dist directory
    for (const pkg of packages) {
        const pkgDist = `${ROOT_DIR}/packages/${pkg.name}/dist`;
        await $`rm -rf ${pkgDist}`.quiet();
        await $`mkdir -p ${pkgDist}`.quiet();
        await $`cp -r ${DIST_DIR}/${pkg.name}/. ${pkgDist}/`.quiet();
        if (await Bun.file(`${DIST_DIR}/bun/${pkg.name}/index.js`).exists()) {
            await $`mkdir -p ${pkgDist}/bun`.quiet();
            await $`cp -r ${DIST_DIR}/bun/${pkg.name}/. ${pkgDist}/bun/`.quiet();
        }
    }

    const elapsed = (performance.now() - start).toFixed(0);
    console.log(`✨ Build completed successfully in \x1b[32m${elapsed}ms\x1b[0m\n`);
}

build().catch((err) => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
