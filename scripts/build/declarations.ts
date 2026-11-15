/**
 * @fileoverview TypeScript declaration (.d.ts) generation and normalization
 * @module scripts/build/declarations
 */

import { $, Glob } from 'bun';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import type { PackageTarget } from './types';

/**
 * Normalizes all relative and alias imports in generated .d.ts files:
 * 1. Resolves internal workspace aliases (@native, @view/native) to relative paths.
 * 2. Adds explicit .js extensions to relative imports for NodeNext/Node16 ESM compatibility.
 */
async function normalizeDeclarations(distDir: string, nativeDir: string): Promise<void> {
    const glob = new Glob('**/*.d.ts');
    for await (const relPath of glob.scan(distDir)) {
        const filePath = join(distDir, relPath);
        const fileDir = dirname(filePath);
        let content = await Bun.file(filePath).text();

        // 1. Rewrite @native/... and @view/native/... to relative paths
        content = content.replace(
            /(['"])@(?:native|view\/native)(?:\/([^'"]+))?\1/g,
            (_, quote, subpath) => {
                const target = subpath ? join(nativeDir, subpath) : join(nativeDir, 'index.js');
                let rel = relative(fileDir, target);
                if (!rel.startsWith('.')) rel = './' + rel;
                return `${quote}${rel}${quote}`;
            },
        );

        // 2. Add .js extension to relative imports
        content = content.replace(
            /(from\s+['"])(\.[^'"]+)(['"])/g,
            (_, prefix, importPath, suffix) => {
                if (importPath.endsWith('.js')) return `${prefix}${importPath}${suffix}`;
                const resolvedPath = resolve(fileDir, importPath);
                if (existsSync(resolvedPath) && statSync(resolvedPath).isDirectory()) {
                    return `${prefix}${importPath}/index.js${suffix}`;
                }
                return `${prefix}${importPath}.js${suffix}`;
            },
        );

        // 3. Normalize import('...') in type annotations
        content = content.replace(
            /(import\(['"])(\.[^'"]+)(['"]\))/g,
            (_, prefix, importPath, suffix) => {
                if (importPath.endsWith('.js')) return `${prefix}${importPath}${suffix}`;
                const resolvedPath = resolve(fileDir, importPath);
                if (existsSync(resolvedPath) && statSync(resolvedPath).isDirectory()) {
                    return `${prefix}${importPath}/index.js${suffix}`;
                }
                return `${prefix}${importPath}.js${suffix}`;
            },
        );

        await Bun.write(filePath, content);
    }
}

/**
 * Runs tsc to generate .d.ts files and organizes them into the dist directory structure
 */
export const generateDeclarations = async (
    rootDir: string,
    distDir: string,
    packages: PackageTarget[],
): Promise<void> => {
    console.log('📘 Generating TypeScript declaration files (.d.ts)...');
    await $`bun x tsc -p tsconfig.build.json`.cwd(rootDir);

    // Structure declarations using Bun Shell
    for (const pkg of packages) {
        await $`mkdir -p ${distDir}/${pkg.name}`.quiet();
        await $`cp -r ${distDir}/packages/${pkg.name}/lib/. ${distDir}/${pkg.name}/`
            .quiet()
            .nothrow();
        await $`cp -r ${distDir}/packages/${pkg.name}/components ${distDir}/${pkg.name}/`
            .quiet()
            .nothrow();

        // Normalize relative path in dist/<pkg>/index.d.ts from '../components' to './components'
        const indexDts = `${distDir}/${pkg.name}/index.d.ts`;
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

    await $`cp -r ${distDir}/src/. ${distDir}/`.quiet().nothrow();
    await $`rm -rf ${distDir}/packages ${distDir}/src`.quiet();

    // Generate root index.d.ts re-exporting discovered packages
    const reExports = packages
        .map(
            (p) =>
                `import * as ${p.name} from './${p.name}/index.js';\n` +
                `export { ${p.name}, ${p.name} as ${p.name.charAt(0).toUpperCase() + p.name.slice(1)} };\n` +
                `export * from './${p.name}/index.js';`,
        )
        .join('\n');
    await Bun.write(`${distDir}/index.d.ts`, `${reExports}\n`);

    // Normalize all .d.ts files for complete NodeNext / node16 resolution
    const nativeDir = `${distDir}/native`;
    await normalizeDeclarations(distDir, nativeDir);
};
