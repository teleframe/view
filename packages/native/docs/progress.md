# Visual Progress Bars

`@teleframe/view/native` provides a lightweight, pure Unicode visual progress bar component (`<ProgressBar>` / `<Progress>`) for rendering progress indicators in Telegram bots.

---

## 1. Quick Example

```tsx
import { ProgressBar } from '@teleframe/view/native';

// 1. Standard Blocks
<ProgressBar value={45} total={100} showPercent />
// Output: ■■■■□□□□□□ 45%

// 2. Colored Emoji Blocks with Fraction Value
<ProgressBar value={8} total={10} style="emoji" showPercent showValue />
// Output: 🟩🟩🟩🟩🟩🟩🟩🟩⬜⬜ 80% (8/10)

// 3. Smooth Bar
<ProgressBar value={60} style="bar" size={15} showPercent />
// Output: █████████░░░░░░ 60%

// 4. Interactive Slider Style
<ProgressBar value={50} style="slider" size={10} />
// Output: ━━━━🔘━━━━━
```

---

## 2. Style Presets

| Preset             | Filled Character | Empty Character | Thumb Indicator |
| :----------------- | :--------------- | :-------------- | :-------------- |
| `blocks` (default) | `■`              | `□`             | —               |
| `bar`              | `█`              | `░`             | —               |
| `circle`           | `●`              | `○`             | —               |
| `emoji`            | `🟩`             | `⬜`            | —               |
| `dots`             | `⬝`              | `·`             | —               |
| `slider`           | `━`              | `━`             | `🔘`            |

Custom characters can be passed via `filled`, `empty`, and `thumb` props:

```tsx
<ProgressBar value={75} filled="⭐" empty="☆" size={10} prefix="Rating: " />
```

---

## 3. Inline Monospace Option (`mono`)

By default, `<ProgressBar>` outputs a string. To render the progress bar inside a Telegram inline `<code>` tag so it retains exact fixed-width spacing on proportional-font clients, pass the `mono` prop:

```tsx
<ProgressBar value={65} mono showPercent />
// Renders: <code>■■■■■■□□□□ 65%</code>
```
