---
name: design-system
description: Дизайн-система GTA6·БЛОГ — brutalist / underground editorial. Токены (цвета, шрифты, spacing, radius, motion), правила использования, hover-паттерны, grain-текстура. Триггерь ЛЮБОЙ раз перед созданием/правкой UI-компонента, стилей, цветов, шрифтов, отступов, границ, анимаций.
---

# GTA6·БЛОГ — Design System

Стиль: **underground editorial / brutalist**. Ни glow, ни soft shadows, ни radial-градиентов, ни округлых карточек, ни emoji в UI.

## Цвета (CSS-переменные)

Все цвета определены в `frontend/src/app/globals.css`. Используй ТОЛЬКО их — никаких хардкод-hex в компонентах.

| Токен | Значение | Назначение |
|---|---|---|
| `--color-bg` | `#0D0D0D` | фон страницы |
| `--color-surface` | `#161616` | карточки, input |
| `--color-elevated` | `#1F1F1F` | футер-логотип, слегка приподнятое |
| `--color-accent` | `#D4FF00` | lime — единственный акцент |
| `--color-accent-hover` | `#B8E000` | приглушённый lime |
| `--color-accent-bright` | `#E4FF4D` | hover primary CTA |
| `--color-text` | `#F5F5F5` | основной текст |
| `--color-text-muted` | `#6B6B6B` | приглушённый / meta |
| `--color-border-subtle` | `rgba(255,255,255,0.06)` | разделители строк |
| `--color-border-default` | `rgba(255,255,255,0.12)` | стандартные бордеры |
| `--color-danger` | `#FF3B3B` | ошибки |
| `--color-success` | `#00D97E` | успех |

**Правило акцента:** lime `#D4FF00` — единственный цветной. Использовать точечно: primary CTA, active-состояние, hover-color на ссылке, метки категорий, pulsing dots. НЕ раскрашивать им блоки текста или большие площади.

## Шрифты

Подключены через `next/font/google` с CSS-переменными в `frontend/src/app/layout.tsx`. Использовать через var:

| Токен | Font | Где |
|---|---|---|
| `--font-display` | Space Grotesk | Заголовки h1/h2/h3, крупные декоративные |
| `--font-body` | Inter | Основной текст (параграфы) |
| `--font-mono` | JetBrains Mono | UI: кнопки, meta, nav, счётчики, лейблы, категории |

**Правила:**
- Заголовки: `font-weight: 500 italic` для «мягких» (Latest dispatches, Gallery); `font-weight: 700` для крупных (hero, featured).
- UI-текст (nav, buttons, timer digits, meta) — ВСЕГДА mono + `letter-spacing: 0.14em…0.25em` + uppercase.
- Кириллица в Space Grotesk не поддержана — большой футер-логотип `GTA6·БЛОГ` падает на fallback (это допустимо).

## Spacing (4px base)

| Токен | Значение |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-7` | 48px |
| `--space-8` | 64px |
| `--space-9` | 96px |

Секции разделены `padding: 88-96px` вертикально. Контент ограничен `max-width: 1200px` + `padding: 0 24px`.

## Radius

**Brutalist = минимальные.**
- `--radius-sm: 2px` — кнопки, input, карточки, бордеры. Дефолт для ВСЕГО.
- `--radius-md: 4px` — редко.
- Круг — только для точек (dot indicators): `border-radius: 50%`.

**НИКОГДА** не использовать `border-radius > 4px` для карточек/кнопок.

## Motion

```css
--duration-fast: 150ms;
--duration-base: 250ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

Все hover-переходы — 150ms `ease-out`. Никаких bounce/spring.

## Keyframes (в globals.css)

- `flipA`, `flipB` — 3D flip таймера (400ms `ease-out`, `rotateX(-90deg → 0)`). Чередуются для соседних смен цифр через ключ у React-элемента, чтобы React remount-нул `<span>` и анимация проиграла заново.
- `pulseDot` — 1.6s / 2.4s мигание точек (`opacity 1 → 0.25`).
- `marquee` — 42s linear infinite для trending bar (`translateX(0 → -50%)`, дублируй список 2 раза).
- `caret` — 900ms step-end для терминального курсора в splash.
- `modalIn` — 250ms `ease-out`, `scale(.95 → 1)` + `opacity(0 → 1)`.
- `hourPulse` — резерв для «часового» пульса lime подсветки на смене часа.

## Hover-паттерны

- **Ссылка**: `color: var(--color-text)` → `var(--color-accent)`. Без `text-decoration`.
- **Строка статьи (article-row)**: `transform: translateX(12px)` + border/color → `--color-accent`. Оформлять через `.article-row:hover` (не inline).
- **Primary CTA**: `background: --color-accent-bright`.
- **Secondary CTA**: `border-color: --color-text`.
- **Gallery tile**: `transform: scale(1.015)` + border → `--color-accent`.
- **Nav link**: color → `--color-accent`.
- **Кнопка-фильтр active**: border + text → `--color-accent`, `background: rgba(212,255,0,0.08)`.

## Иконки / декор

- НЕТ иконочного шрифта. Все «иконки» — типографика: `→`, `●`, `//`, `[СКОБКИ]`, `_` (blinking cursor).
- Кнопки часто в квадратных скобках: `[ПОДПИСАТЬСЯ]`, `[ЗАГРУЗИТЬ ЕЩЁ ↓]`, `[ОК →]`.
- Подзаголовки-метки с префиксом `//`: `// ОБРАТНЫЙ ОТСЧЁТ`, `// ПОДОЖДИ`, `// БАЗА ЗНАНИЙ`.
- Логотип: `GTA6_БЛОГ_` — подчёркивание в конце цветом `--color-accent`.

## Копирайт и язык

**Все UI-элементы — на русском.** Аудитория — массовая СНГ (18-35, часть школьники/студенты); английский editorial-стиль считывается как pretentious.

Английский допустим ТОЛЬКО в:
- **Именах собственных**: GTA VI, Vice City, Rockstar, Take-Two, PS5, Xbox, DTF и т.п.
- **Технических константах** в коде (`ArticleTag = "TRAILER" | "LEAK" ...`) — но в UI мапить через `CATEGORY_LABEL` / `CATEGORY_LABEL_UPPER` из `lib/i18n.ts`.
- **Splash CRT-terminal** (`> BOOTING GTA6_BLOG...`) — код-эстетика, читается как ASCII-декор.
- **Wordmark логотипа** `GTA6_БЛОГ_` — сам бренд.

Переводы категорий/меток:

| ENUM | UI (Title) | UI (UPPER) |
|---|---|---|
| TRAILER | Трейлер | ТРЕЙЛЕР |
| LEAK | Утечка | УТЕЧКА |
| MAP | Карта | КАРТА |
| CHARACTER | Персонаж | ПЕРСОНАЖ |
| GAMEPLAY | Геймплей | ГЕЙМПЛЕЙ |
| RUMOR | Слух | СЛУХ |

**Никогда не хардкодь** русский лейбл для категории в компоненте — используй `CATEGORY_LABEL_UPPER[tag]` из [lib/i18n.ts](../../../frontend/src/lib/i18n.ts).

## Grain-текстура

Обязательно на body: fixed inset:0, opacity 0.04, SVG feTurbulence (baseFrequency 0.85, 3 octaves), pointer-events:none, z-index:3. Уже реализовано в `frontend/src/app/layout.tsx`. Без неё — «AI-look», категорически нельзя удалять.

## Focus

`:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` — уже в globals. Не отключать outline у кнопок.

## Selection

`::selection { background: var(--color-accent); color: var(--color-bg); }` — уже в globals.

## Как использовать в компонентах

Пиши стили inline через объект + `var(--color-…)`, ИЛИ через классы + `style` теги внутри компонента для hover-состояний (см. `LatestSection.tsx`, `Gallery.tsx`). Tailwind utility за пределами обёрток НЕ нужны — токены уже в `@theme inline`, но для brutalist inline-style читабельнее.

## Чек-лист перед PR

- [ ] Ни одного хардкод `#…` (кроме комментов) — только `var(--…)`.
- [ ] Ни одного `border-radius > 4px` на карточках/кнопках.
- [ ] Ни `box-shadow`, ни `filter: drop-shadow`, ни `background: radial-gradient`.
- [ ] Все UI-строки (кнопки, meta, nav) — mono + uppercase + letter-spacing.
- [ ] Все hover — 150-200ms ease-out.
- [ ] Крупные заголовки — Space Grotesk, `letter-spacing: -0.02…-0.04em`.
