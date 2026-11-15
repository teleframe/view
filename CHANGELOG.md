# Changelog

All notable changes to this project will be documented in this file. See [Conventional Commits](https://www.conventionalcommits.org/) for commit guidelines.

## [0.2.1](https://github.com/teleframe/view/compare/v0.2.0...v0.2.1) (2026-11-15)


### 🐛 Bug Fixes

* **ci:** ignore auto-generated CHANGELOG.md and deno.json in bunfig formatter ([#3](https://github.com/teleframe/view/issues/3)) ([52f27d3](https://github.com/teleframe/view/commit/52f27d30ca42eaa431cec02b4d87afb3d5ebe4d1))

## [0.2.0](https://github.com/teleframe/view/compare/v0.1.0...v0.2.0) (2026-11-15)


### ✨ Features

* **arch:** configure clean workspace aliases and root module re-exports ([0af4949](https://github.com/teleframe/view/commit/0af49492e2887bf50130c860765bbd4b9a3f45e1))
* **component:** add Blockquote component with expandable quote support ([f4d684b](https://github.com/teleframe/view/commit/f4d684bdb82963628f6b9683023bac7eb86aa9dc))
* **component:** add Bold component and bold() functional helper ([4f91604](https://github.com/teleframe/view/commit/4f916049b2e941abf523ae305e4cf3e8d2de1055))
* **component:** add Code and Mono components with compile-time nesting safety ([3044d11](https://github.com/teleframe/view/commit/3044d11de3df6f838ba416f1ddab179961d6ea6c))
* **component:** add Emoji component for telegram premium custom animated emoji ([cca4e5b](https://github.com/teleframe/view/commit/cca4e5bbee0a9a01092b70381367775c7fc21109))
* **component:** add Italic component and italic() functional helper ([fd65430](https://github.com/teleframe/view/commit/fd65430d9d78d8819f6439cac2a9889c2cb5e0ca))
* **component:** add Link and User mention components ([8d8d53a](https://github.com/teleframe/view/commit/8d8d53a4ae091349dd53b6d993bd95b2cc06c68b))
* **component:** add polymorphic Br, Paragraph, and Divider layout components ([d0ead56](https://github.com/teleframe/view/commit/d0ead56598a967c62c8b196db9506b81fa0e4f3f))
* **component:** add polymorphic List, Ul, Ol, and Li components with presets and indentation ([4040acd](https://github.com/teleframe/view/commit/4040acd0a747d05bbd2450126abab07b347f7769))
* **component:** add Pre and CodeBlock components with syntax highlighting ([a817403](https://github.com/teleframe/view/commit/a8174036ee7192c6ca9a2b0b0fedd76dc17e368c))
* **component:** add ProgressBar, Show, Each, and RawHtml components ([e4e8acf](https://github.com/teleframe/view/commit/e4e8acf90090c9ff92043c0c6065445f9f5de51e))
* **component:** add Spoiler component and spoiler() functional helper ([4dff0d9](https://github.com/teleframe/view/commit/4dff0d9274d287bd9937bb25d617540ff25750a9))
* **component:** add Strike component and strike() functional helper ([30698eb](https://github.com/teleframe/view/commit/30698eb4e086953adb6536afea21f97614887346))
* **component:** add Time component and normalization engine for bot api 9.0 tg-time ([c0313b8](https://github.com/teleframe/view/commit/c0313b8a605b4d573c275129bd5f1f9c85992b45))
* **component:** add Underline component and underline() functional helper ([a49f72f](https://github.com/teleframe/view/commit/a49f72fc6f3b3992046310056a6d313573c653c2))
* **core:** initialize project scaffold and declarative native view engine ([c807389](https://github.com/teleframe/view/commit/c80738921e25a8d2cdf467e1c257ea24e8644ad0))
* **deno:** add native Deno 2 and JSR support with isolated test suite ([167ef1c](https://github.com/teleframe/view/commit/167ef1c4e85fe511759ccc12842716f5cb0077ce))
* **entities:** implement MessageEntity compiler with utf-16 offset calculation ([c87c22b](https://github.com/teleframe/view/commit/c87c22bbe72d60e40df6eb786545a5b7c8caf4de))
* **example:** create interactive showcase bot with 13 screens and zero-jsx builder page ([6a3e121](https://github.com/teleframe/view/commit/6a3e121bc7cdb598deda8df6539d04eb7a4dbfb6))
* **jsx-runtime:** implement automatic jsx runtime, dev runtime, and classic h factory ([38d8738](https://github.com/teleframe/view/commit/38d87388fe7202a99c0c29dc9335f5f85908c795))
* **markup:** configure umbrella telegram-markup package, build system, and export maps ([9b4e653](https://github.com/teleframe/view/commit/9b4e6538fbb815ebd1bbb4a399e67b768d0be806))
* **native:** export TelegramSecurityError and normalize layout numeric parameters ([1d87160](https://github.com/teleframe/view/commit/1d871600c8bb07075986d2919c4fac34ec03b4c2))
* **native:** finalize native package entrypoint, manifest, and documentation ([5091d29](https://github.com/teleframe/view/commit/5091d298bf400a20b2aa4e263c098e16b4754e75))
* **render:** implement unified render() compiler and renderToString() html serializer ([d559835](https://github.com/teleframe/view/commit/d5598354bfea5cb485382f5ef61caf0d36a51dab))
* **sanitizer:** implement dynamic html escaping, attribute filtering, and url whitelist ([da8d575](https://github.com/teleframe/view/commit/da8d575708f66e9d3191d459aabd1f8bf606112d))
* **types:** define virtual node types, intrinsic telegram tags, and jsx namespace ([98cae80](https://github.com/teleframe/view/commit/98cae8044048c65c66426005788c181aadd49cec))
* **validation:** implement pre-flight nesting and message length limit validators ([1aa1d84](https://github.com/teleframe/view/commit/1aa1d842652fea02fe6fe9ad655af63ee0beb768))


### 🐛 Bug Fixes

* **build:** normalize declaration imports and extensions for NodeNext compatibility ([b7ed6b2](https://github.com/teleframe/view/commit/b7ed6b2e5e3000bf32f0b15c9d27c941be188360))
* **native:** enforce complete Bot API nesting matrix forbidding code and pre inside formatting tags ([ab56028](https://github.com/teleframe/view/commit/ab560281370520ac32d208d27bc13d1695407886))
* **native:** ensure single-pass evaluation, Telegram-accurate length validation, and strict required props ([eae51fb](https://github.com/teleframe/view/commit/eae51fb7f75b2f829020b9d97c3d2f34d7b77b74))
* **native:** normalize tg-time attributes, harden user ID validation, and optimize overlap checks ([0b83185](https://github.com/teleframe/view/commit/0b831853542984ae901399dff3ff1dfad5875188))
* **native:** preserve AST hierarchy order when sorting identical entity boundaries ([d2e980a](https://github.com/teleframe/view/commit/d2e980a7bb2a63b96442ba191d2c8f5de9d4ec08))
* **native:** reject incompatible entity children inside links and add Link &gt; Time tests ([b5aa374](https://github.com/teleframe/view/commit/b5aa374aa3a9b38b6c9354c13b69fe628a475d6c))
* **native:** replace catalog protocol in package manifests with valid semver ranges for npm compatibility ([730517e](https://github.com/teleframe/view/commit/730517ea261020ede91a220d9bb6f4395901474a))
* **native:** support decimal and hexadecimal numerical HTML entities in limit validation ([d2a9a5f](https://github.com/teleframe/view/commit/d2a9a5fbd2db786b38b14c55357d15c57cde473d))
* **native:** use single-pass regex to decode HTML entities without double-decoding ([57124ff](https://github.com/teleframe/view/commit/57124ff461b95559ee518560ba2d7f4a55621de5))


### ⚡ Performance Improvements

* **native:** optimize entity overlap check with active ancestor stack and add multi-series benchmark suite ([d699f54](https://github.com/teleframe/view/commit/d699f54d57d5b6102778382cec7c55c087111da3))


### ♻️ Code Refactoring

* **core:** modularize engine, tests, and build tooling to &lt;=200 lines ([730d540](https://github.com/teleframe/view/commit/730d540bd5de38059f46d8322b898fe79e90441a))
* **example:** modularize benchmark and live test suites to &lt;=200 lines ([cc1c2dc](https://github.com/teleframe/view/commit/cc1c2dc21e94de92d8963259476e93548e49a4dc))
* **native:** configure internal module aliases in native tsconfig and keep root clean ([fbcd3c6](https://github.com/teleframe/view/commit/fbcd3c691887b08fdee5648edde54be4d3e31a8c))
* **native:** rename internal workspace module to @view/native ([8283341](https://github.com/teleframe/view/commit/828334179a5c5f90cb0ec86f48a593f231b47f70))


### 📚 Documentation

* **native:** align custom emoji requirements with official Bot API terms ([ca09155](https://github.com/teleframe/view/commit/ca0915551ade925f468204a1389f9ed3bd8a2fc3))
* **native:** clarify Telegram limit mechanics, RawHtml caveats, platform constraints, and scope ([573ccd2](https://github.com/teleframe/view/commit/573ccd2c1a5fbc6ac5c836aea5e0d4778137d17c))
* **native:** document layout numeric bounds and clarify unbounded string props ([7775a1c](https://github.com/teleframe/view/commit/7775a1c68e85e6f6a99de7b150421282e4045467))

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
