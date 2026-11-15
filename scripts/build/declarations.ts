/**
 * @fileoverview TypeScript declaration (.d.ts) generation and normalization
 * @module scripts/build/declarations
 */

import { $ } from 'bun';
import type { PackageTarget } from './types';

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
};
