## Summary

<!-- Brief description of what this PR does and why -->

## Changes

<!-- List specific changes, added features, or fixed bugs -->

-

## Conventional Commits / PR Title

- [ ] PR title follows the Conventional Commits format: `<type>(<scope>): <subject>` (e.g., `feat(native): add table widget`, `fix(security): sanitize url schemes`)
- [ ] Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

## Checklist

- [ ] All new and existing code follows the strict **<= 200 lines per file** rule
- [ ] Code formatted with `bun run fmt`
- [ ] Static type analysis passes (`bun run check` & `deno task check`)
- [ ] Full test suite passes (`bun test` & `deno test tests/deno.test.tsx`)
- [ ] Release verification passes (`bun run verify:release`)
