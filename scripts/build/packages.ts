/**
 * @fileoverview Monorepo package and entrypoint discovery
 * @module scripts/build/packages
 */

import { Glob } from 'bun';
import type { PackageEntry, PackageTarget } from './types';

/**
 * Automatically discovers packages and all their entrypoints (index, jsx-runtime, etc.)
 */
export const discoverPackages = async (rootDir: string): Promise<PackageTarget[]> => {
    const glob = new Glob('packages/*/{lib,src,}/index.{tsx,ts}');
    const targets: PackageTarget[] = [];
    const seen = new Set<string>();

    for await (const file of glob.scan(rootDir)) {
        const parts = file.split('/');
        const pkgName = parts[1];
        if (!pkgName || seen.has(pkgName)) continue;
        seen.add(pkgName);

        const dir = file.substring(0, file.lastIndexOf('/'));
        const entries: PackageEntry[] = [{ subpath: 'index', sourceFile: `${rootDir}/${file}` }];

        // Check for companion jsx-runtime / jsx-dev-runtime
        const jsxRuntime = `${rootDir}/${dir}/jsx-runtime.ts`;
        if (await Bun.file(jsxRuntime).exists()) {
            entries.push({ subpath: 'jsx-runtime', sourceFile: jsxRuntime });
        }

        const jsxDevRuntime = `${rootDir}/${dir}/jsx-dev-runtime.ts`;
        if (await Bun.file(jsxDevRuntime).exists()) {
            entries.push({ subpath: 'jsx-dev-runtime', sourceFile: jsxDevRuntime });
        }

        targets.push({
            name: pkgName,
            entries,
        });
    }

    return targets;
};
