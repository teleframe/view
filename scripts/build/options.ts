/**
 * @fileoverview CLI and environment build options parser
 * @module scripts/build/options
 */

import type { BuildOptions } from './types';

export const parseOptions = (args: string[] = process.argv.slice(2)): BuildOptions => {
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
};
