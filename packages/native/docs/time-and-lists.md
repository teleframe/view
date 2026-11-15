# Date/Time & Lists

## 1. Telegram Formatted Date & Time (`<Time>`)

Telegram Bot API 9.0 introduced the `<tg-time>` tag, which automatically displays timestamps in the client's local timezone and language, updating relative times (e.g. "5 minutes ago") in real time.

### The Problem

Raw Telegram time format strings are cryptic and non-intuitive:

- Relative: `'r'`
- Full date and time: `'wDT'`
- Short date and time: `'dt'`

### The Solution: Human-Friendly Aliases & Boolean Flags

The `<Time>` component allows you to pass JavaScript `Date` objects, Unix timestamps, human-readable aliases, or simple boolean flags:

```tsx
import { Time } from '@telegram-markup/native';

// 1. Using Human-Readable Aliases
<Time date={new Date()} format="relative" />      // "5 minutes ago"
<Time date={new Date()} format="full" />          // "Monday, 24 July 2024, 14:30:00"
<Time date={new Date()} format="date-long" />     // "24 July 2024"

// 2. Using Intuitive Boolean Flags
<Time date={new Date()} relative />
<Time date={new Date()} weekday dateLong timeShort />

// 3. Fallback for older clients
<Time date={new Date()} format="relative">
  Just now
</Time>
```

Supported Format Aliases:

- `relative`, `rel`, `ago` $\rightarrow$ `'r'`
- `time`, `time-short`, `short-time` $\rightarrow$ `'t'`
- `time-long`, `time-seconds` $\rightarrow$ `'T'`
- `date`, `date-short`, `short-date` $\rightarrow$ `'d'`
- `date-long`, `long-date` $\rightarrow$ `'D'`
- `weekday`, `day` $\rightarrow$ `'w'`
- `datetime`, `short` $\rightarrow$ `'dt'`
- `medium`, `date-long-time` $\rightarrow$ `'Dt'`
- `full` $\rightarrow$ `'wDT'`

---

## 2. Lists (`<List>`, `<Ul>`, `<Ol>`, `<Li>`)

Constructing clean indented bullet or numbered lists in Telegram messages is made effortless with dedicated list components.

```tsx
import { Li, Ol, Ul } from '@telegram-markup/native';

// Unordered List with presets:
<Ul bullet="check">
  <Li>Database connected</Li>
  <Li>Redis cache warmed up</Li>
  <Li marker="❌ ">Storage backup pending</Li>
</Ul>

// Ordered List with Roman Numerals:
<Ol start={1} numberStyle="roman">
  <Li>Phase One: Scaffolding</Li>
  <Li>Phase Two: Implementation</Li>
  <Li>Phase Three: Deployment</Li>
</Ol>
```

### Numbering Styles

- `dot`: `1. `, `2. `, `3. `
- `paren`: `1) `, `2) `, `3) `
- `roman`: `I. `, `II. `, `III. `
- `alpha`: `a. `, `b. `, `c. `

### Bullet Presets

- `bullet`: `• `
- `dash`: `— `
- `hyphen`: `- `
- `star`: `* `
- `circle`: `○ `
- `check`: `✅ `
- `cross`: `❌ `
- `arrow`: `👉 `
- `pointer`: `▸ `
