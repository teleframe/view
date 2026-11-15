# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://www.conventionalcommits.org/) for commit guidelines.

## 0.1.0 (2026-11-15)

### ✨ Features

- Initial release of `@teleframe/view`.
- Declarative JSX/TSX view engine for Telegram Bot API (HTML string compilation & native Telegram entities mode).
- Layout and typography components: `Bold`, `Italic`, `Underline`, `Strike`, `Spoiler`, `Code`, `Pre`, `Blockquote`, `Link`, `User`, `Emoji`, `Time`.
- Structural and utility components: `Paragraph`, `Divider`, `ProgressBar`, `Li`, `Ul`, `Ol`.
- Declarative control flow components: `Show`, `Each`.
- Functional builders API (`bold()`, `italic()`, `code()`, `link()`, etc.) alongside JSX.
- Multi-runtime support: native Deno 2 runtime with JSR publishing, alongside Node.js and Bun with npm distribution.
- Automated release pipelines with Release Please and Provenance attestation.
