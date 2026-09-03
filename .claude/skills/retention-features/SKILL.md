---
name: retention-features
description: Спецификация 5 фишек удержания на главной — Timer с flip, Reading progress + mini-timer, живые счётчики социального доказательства, Splash CRT terminal, Exit-intent модалка. Триггерь при работе с этими фичами, отладке, регрессиях, добавлении похожих механик.
---

# 5 фишек удержания

Обязательный набор для MVP. Все на главной (`HomePage.tsx`). Их наличие — часть продукта, не декор. При регрессиях — чинить в приоритете.

---

## Фишка №1: Живой таймер с flip-анимацией

**Где (после IA v2):**
- **TopBar** (`TopBar.tsx`, `layout/`): микро-версия `247d 14h TO RELEASE · 26.05.2026` — тонкая полоска 32px над header. Всегда виден, но не отжирает первый экран.
- **CountdownTracker** (`home/CountdownTracker.tsx`, id=`countdown`): крупные цифры в отдельной секции-tracker с копирайтом «Why it matters». Расположен между FromArchive и Featured.
- **MiniTimer** (см. Фишку №2): плашка bottom-right при скролле >75vh.

Все три источника — один `useCountdown(RELEASE_DATE)` хук в `hooks/useCountdown.ts`.

**Что делает:**
- Показывает дни / часы / минуты / секунды до релиза GTA VI (`RELEASE_DATE` в `lib/constants.ts`).
- Каждую смену цифры — 3D flip (`rotateX(-90deg → 0deg)`, 400ms `ease-out`).
- Дни в lime, остальное — white.
- Обновляется каждую секунду через `setInterval` в `useEffect` внутри хука.

**Как реализован flip:**
Не через CSS-переменные — через **пересборку React-элемента** с новым `key`. При каждом ре-рендере ключ `key={`${label}-${value}`}` меняется, React remount-ит `<span>`, и CSS-анимация проигрывается заново.

Чередование `flipA`/`flipB` держится в state `flip: {d,h,m,s: 0|1}` — переключается при смене значения (см. `computeTimer` в `HomePage.tsx`). Это защита на случай двух одинаковых значений подряд.

**Регрессии, на которые смотреть:**
- Убрал `key` — flip перестал играть.
- Убрал `keyframes flipA` / `flipB` из globals.css — то же.
- Клиент-компонент случайно стал server — интервалы не запустятся.

**Расширения (не в MVP, план):**
- Каждый час — короткий lime pulse первой цифры (`hourPulse` keyframe уже определён, не подключён).
- «Часовой» pulse также в TopBar — короткое подсвечивание цифры часов.

**Регрессии для IA v2:**
- Убрать TopBar → пользователь не видит countdown в первом экране (мемо-хук пропадает).
- Убрать CountdownTracker → фичи `Why it matters` не будет, ссылка `[WHY IT MATTERS →]` в TopBar ведёт в никуда.

---

## Фишка №2: Reading progress + sticky mini-timer

**Где:** fixed-элементы в `HomePage.tsx`.

**Progress bar:**
- 2px lime полоска в самом верху (z-index 60, pointer-events:none).
- Ширина = `scrollY / (scrollHeight - viewport)` × 100vw.
- `transition: width 90ms linear` (не резко).
- Обновляется в `onScroll` через `setProgress`.

**Mini-timer:**
- Появляется когда `window.scrollY > window.innerHeight * 0.75` (проскроллили >3/4 экрана).
- Bottom-right, `position: fixed`, z-index 50.
- Формат: `247d 14h · GTA VI · ×`. Кнопка `×` закрывает через state `miniClosed`.
- **Плановое:** закрытие сохранять в `localStorage.gta6_miniClosed` до конца сессии (сейчас только в state).

**Регрессии:**
- Забыть `passive: true` на scroll listener → лаги на мобиле.
- Порог `0.75` слишком маленький → показывает сразу.

---

## Фишка №3: Живые счётчики социального доказательства

**Где:** размазаны по главной.

Реализованные и плановые:

| Место | Что | Статус | Источник |
|---|---|---|---|
| TrendingBar (после hero) | marquee «топ-3 статьи за час» + числа | ✅ мок (`TRENDING`) | будет `/api/articles/trending` |
| Реакции на статьях | число рядом с `●` | ⏳ фейк «2.4K» | `articles.reactions[type]` |
| Header nav «БЛОГ» | pulsing lime dot | ✅ реализовано | статично |
| Footer «● 247 online now» | pulsing dot + число | ✅ фейк | будет `GET /api/stats/online` (обновление 30s) |
| Subscribe | «// 12,847 subscribers · N days until release» | ✅ subscribers статичный, days из timer | subs — из бэка позже |

**Ключевой паттерн:** число ВСЕГДА рядом с pulsing lime dot — это визуальный сигнал «живой».

**Регрессии:**
- Удалить keyframe `pulseDot` — точки замрут.
- Заменить фейк-числа на 0 без бэка → выглядит мёртво. Держать фейки до подключения API.

---

## Фишка №4: Splash screen CRT terminal

**Где:** `Splash.tsx`, оркестрируется из `HomePage.tsx`.

**Триггер:** только при первом визите — проверка `localStorage.gta6_firstVisit`. После показа — ставится флаг, больше не показывать.

**Как выглядит:**
- Fullscreen black overlay (z-index 90).
- Внутри — рамка с lime-25%-бордером, `#050505` фон.
- Header: `CRT TERMINAL · GTA6_BLOG` (muted mono).
- 3 строки печатаются по одной с интервалом 480ms:
  ```
  > BOOTING GTA6_BLOG...
  > LOADING VICE CITY...
  > READY._   ← blinking cursor (caret keyframe)
  ```
- Через 2100ms — исчезает (`setSplash(false)`).

**Тонкости реализации:**

⚠️ **React StrictMode в dev монтирует эффект дважды** — cleanup срабатывает сразу и глушит `setInterval` / `setTimeout`. Поэтому в `HomePage.tsx`:
- Guard `splashInitRef.current` предотвращает второй запуск.
- В эффекте splash НЕ возвращается cleanup (иначе первый монт → cleanup → второй монт заблокирован рефом → таймеры мертвы). Splash — одноразовый эффект, компонент не размонтируется в норме, утечки нет.

**Регрессии:**
- Вернуть cleanup для timeout → сплэш зависнет навсегда.
- Убрать ref-guard → StrictMode запустит два таймера, лайны напечатаются мгновенно.
- Забыть `localStorage.setItem` → показ каждый визит.

**Тестировать локально:** `localStorage.removeItem('gta6_firstVisit'); location.reload()`.

---

## Фишка №5: Exit-intent модалка

**Где:** `ExitIntent.tsx`, триггер в `HomePage.tsx`.

**Триггер (desktop):** `document.addEventListener('mouseleave', ...)`, срабатывает когда `e.clientY <= 0` (курсор ушёл за верх окна).

**Триггер (mobile, планируется):** scroll up после 50% страницы + 15s на сайте.

**Показ:** 1 раз за сессию. Управляется `exitShownRef` (ref, не state — не сбрасывается при рендере).

**Планируется:** не показывать если уже подписан (`localStorage.gta6_subscribed`).

**Модалка:**
- Overlay `rgba(0,0,0,0.72)` fullscreen, z-index 80. Клик по overlay = закрыть.
- Внутри — карточка 480px max-width, lime border 1px, `#161616` фон.
- `animation: modalIn 250ms ease-out`.
- Meta: `// WAIT`.
- Заголовок: `Don't leave empty-handed`.
- Email input + `[OK →]`.
- Секондари: `→ NO THANKS` (закрывает).

**Регрессии:**
- Убрать `stopPropagation` в inner div → клик по карточке закрывает модалку.
- Пропустить `exitShownRef` → показ на каждый выход курсора, спам.

---

## Как эти фишки взаимодействуют

- Splash сначала занимает экран → пользователь физически не видит остальные фичи первые 2 сек.
- Reading progress + mini-timer работают ТОЛЬКО после того как пользователь начал скроллить.
- Exit-intent НЕ должен показываться поверх splash — так как проверка `e.clientY <= 0` может сработать пока курсор ещё «уводится» с splash. На практике не наблюдается, но при регрессиях проверить.

## Метрики

Каждая фишка привязана к метрике удержания:

- Timer + progress + mini-timer → **глубина просмотра**.
- Splash + exit-intent → **% возвращающихся** (splash — memorability, exit-intent — email conversion).
- Живые счётчики → **время на странице** (социальное доказательство).

## Что НЕ считается фишкой удержания

- Комменты — вовлечение, не удержание.
- Реакции — тот же.
- SEO — привлечение, не удержание.

## Cross-references

- Дизайн-токены (`--color-accent`, keyframes) → `design-system`.
- LocalStorage keys → `site-map`.
