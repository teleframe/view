#!/usr/bin/env bun
/**
 * @file Native Bun build pipeline (Zero Node.js module imports):
 * - Bun.build for bundling
 * - Bun Shell ($) for terminal execution and file operations
 * - Bun.Glob for package discovery
 * - Bun.file & Bun.write for file operations
 */

import { $, Glob } from 'bun';

const ROOT_DIR = import.meta.dir;
const DIST_DIR = `${ROOT_DIR}/dist`;
const SRC_DIR = `${ROOT_DIR}/src`;

interface PackageEntry {
    subpath: string; // e.g. 'index', 'jsx-runtime', 'jsx-dev-runtime'
    sourceFile: string;
}

interface PackageTarget {
    name: string;
    entries: PackageEntry[];
}

interface BuildOptions {
    isProd: boolean;
    minify: boolean;
    emitTypes: boolean;
}

function parseOptions(): BuildOptions {
    const args = process.argv.slice(2);
    const envNodeEnv = process.env.NODE_ENV?.toLowerCase();
    const envBuildMode = process.env.BUILD_MODE?.toLowerCase();
    const envMinify = process.env.MINIFY?.toLowerCase();

    const isProdFlag = args.includes('--prod') || args.includes('--production');
    const isDevFlag = args.includes('--dev') || args.includes('--development');

    let isProd = true;
    if (isDevFlag) {
        isProd = false;
    } else if (isProdFlag) {
        isProd = true;
    } else if (
        envBuildMode === 'dev' ||
        envBuildMode === 'development' ||
        envNodeEnv === 'development'
    ) {
        isProd = false;
    }

    let minify = isProd;
    if (args.includes('--minify')) minify = true;
    if (args.includes('--no-minify')) minify = false;
    if (envMinify === 'true' || envMinify === '1') minify = true;
    if (envMinify === 'false' || envMinify === '0') minify = false;

    const emitTypes = !args.includes('--no-types');

    return { isProd, minify, emitTypes };
}

/**
 * Automatically discovers packages and all their entrypoints (index, jsx-runtime, etc.)
 */
async function discoverPackages(): Promise<PackageTarget[]> {
    const glob = new Glob('packages/*/{lib,src,}/index.{tsx,ts}');
    const targets: PackageTarget[] = [];
    const seen = new Set<string>();

    for await (const file of glob.scan(ROOT_DIR)) {
        const parts = file.split('/');
        const pkgName = parts[1];
        if (!pkgName || seen.has(pkgName)) continue;
        seen.add(pkgName);

        const dir = file.substring(0, file.lastIndexOf('/'));
        const entries: PackageEntry[] = [{ subpath: 'index', sourceFile: `${ROOT_DIR}/${file}` }];

        // Check for companion jsx-runtime / jsx-dev-runtime
        const jsxRuntime = `${ROOT_DIR}/${dir}/jsx-runtime.ts`;
        if (await Bun.file(jsxRuntime).exists()) {
            entries.push({ subpath: 'jsx-runtime', sourceFile: jsxRuntime });
        }

        const jsxDevRuntime = `${ROOT_DIR}/${dir}/jsx-dev-runtime.ts`;
        if (await Bun.file(jsxDevRuntime).exists()) {
            entries.push({ subpath: 'jsx-dev-runtime', sourceFile: jsxDevRuntime });
        }

        targets.push({
            name: pkgName,
            entries,
        });
    }

    return targets;
}

async function build() {
    const options = parseOptions();
    const start = performance.now();
    const modeLabel = options.isProd ? '\x1b[32mproduction\x1b[0m' : '\x1b[33mdevelopment\x1b[0m';
    const minifyLabel = options.minify ? 'enabled' : 'disabled';
    const typesLabel = options.emitTypes ? 'enabled' : 'disabled';

    console.log(
        `⚡ Starting build [mode: ${modeLabel}, minify: ${minifyLabel}, types: ${typesLabel}]...`,
    );

    // 1. Clean dist/ using Bun Shell ($)
    await $`rm -rf ${DIST_DIR}`.quiet();
    await $`mkdir -p ${DIST_DIR}`.quiet();

    const external = ['react', 'react/*', 'react/jsx-runtime'];
    const packages = await discoverPackages();

    const define: Record<string, string> = {
        'process.env.NODE_ENV': options.isProd ? '"production"' : '"development"',
    };

    // 2. Build root entrypoint (src/index.ts)
    const rootEntry = `${SRC_DIR}/index.ts`;
    if (await Bun.file(rootEntry).exists()) {
        // Node ESM
        await Bun.build({
            entrypoints: [rootEntry],
            outdir: DIST_DIR,
            naming: 'index.js',
            target: 'node',
            format: 'esm',
            external,
            define,
            minify: options.minify,
        });

        // Bun target
        await Bun.build({
            entrypoints: [rootEntry],
            outdir: `${DIST_DIR}/bun`,
            naming: 'index.js',
            target: 'bun',
            format: 'esm',
            external,
            define,
            minify: options.minify,
        });
    }

    // 3. Build discovered packages and all their sub-entrypoints
    for (const pkg of packages) {
        for (const entry of pkg.entries) {
            // Node ESM
            await Bun.build({
                entrypoints: [entry.sourceFile],
                outdir: `${DIST_DIR}/${pkg.name}`,
                naming: `${entry.subpath}.js`,
                target: 'node',
                format: 'esm',
                external,
                define,
                minify: options.minify,
            });

            // Bun target
            await Bun.build({
                entrypoints: [entry.sourceFile],
                outdir: `${DIST_DIR}/bun/${pkg.name}`,
                naming: `${entry.subpath}.js`,
                target: 'bun',
                format: 'esm',
                external,
                define,
                minify: options.minify,
            });
        }
    }

    // 4. Generate TypeScript declarations
    if (options.emitTypes) {
        console.log('📘 Generating TypeScript declaration files (.d.ts)...');
        await $`bun x tsc -p tsconfig.build.json`.cwd(ROOT_DIR);

        // Structure declarations using Bun Shell
        for (const pkg of packages) {
            await $`mkdir -p ${DIST_DIR}/${pkg.name}`.quiet();
            await $`cp -r ${DIST_DIR}/packages/${pkg.name}/lib/. ${DIST_DIR}/${pkg.name}/`
                .quiet()
                .nothrow();
            await $`cp -r ${DIST_DIR}/packages/${pkg.name}/components ${DIST_DIR}/${pkg.name}/`
                .quiet()
                .nothrow();

            // Normalize relative path in dist/<pkg>/index.d.ts from '../components' to './components'
            const indexDts = `${DIST_DIR}/${pkg.name}/index.d.ts`;
            if (await Bun.file(indexDts).exists()) {
                const content = await Bun.file(indexDts).text();
                await Bun.write(
                    indexDts,
                    content
                        .replace(/'\.\.\/components'/g, "'./components'")
                        .replace(/"\.\.\/components"/g, '"./components"'),
                );
            }
        }

        await $`cp -r ${DIST_DIR}/src/. ${DIST_DIR}/`.quiet().nothrow();
        await $`rm -rf ${DIST_DIR}/packages ${DIST_DIR}/src`.quiet();

        // Generate root index.d.ts re-exporting discovered packages
        const reExports = packages.map((p) => `export * from './${p.name}/index.js';`).join('\n');
        await Bun.write(`${DIST_DIR}/index.d.ts`, `${reExports}\n`);
    }

    // 5. Mirror build artifacts into each package's dist directory for standalone packaging
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
