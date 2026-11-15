/**
 * @fileoverview Build pipeline type definitions
 * @module scripts/build/types
 */

export interface PackageEntry {
    subpath: string; // e.g. 'index', 'jsx-runtime', 'jsx-dev-runtime'
    sourceFile: string;
}

export interface PackageTarget {
    name: string;
    entries: PackageEntry[];
}

export interface BuildOptions {
    isProd: boolean;
    minify: boolean;
    emitTypes: boolean;
}
