import { $ } from 'bun';

const branch = (await $`git rev-parse --abbrev-ref HEAD`.text()).trim();

// Detached HEAD (e.g. CI, rebase, tags)
if (branch === 'HEAD') {
    process.exit(0);
}

const pattern =
    /^(main|master|release-please--.+|(feat|fix|chore|docs|refactor|test|ci|perf|release)\/.+)$/;

if (!pattern.test(branch)) {
    console.error(`\x1b[31m❌ Invalid git branch name: "${branch}"\x1b[0m`);
    console.error('👉 Branch names must follow conventional naming:');
    console.error('   <type>/<description>  (e.g., feat/add-widget, fix/url-parsing, chore/deps)');
    console.error('   Allowed types: feat, fix, chore, docs, refactor, test, ci, perf, release');
    process.exit(1);
}
