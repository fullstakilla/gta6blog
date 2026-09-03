---
name: seo
description: SEO-стратегия — стратегии рендеринга (ISR/SSG/on-demand revalidate), metadata и Twitter cards, JSON-LD схемы, sitemap/robots/OG-images, СНГ-специфика (Яндекс). Триггерь при любой SEO-задаче, добавлении новой публичной страницы, работе с метадатой, изменении контентной модели.
---

# SEO — GTA6·БЛОГ

**Критично реализовать с первого дня.** SEO — главный канал привлечения аудитории. Все публичные страницы должны быть pre-rendered или ISR.

---

## Стратегия рендеринга

| Route | Стратегия | Обоснование |
|---|---|---|
| `/` | ISR `revalidate: 60` | trending обновляется раз в минуту |
| `/blog` | ISR `revalidate: 300` | список редко меняется |
| `/blog/[slug]` | SSG + `generateStaticParams()` + ISR `revalidate: 3600` + on-demand | статьи почти неизменны, on-demand при правках |
| `/gallery` | SSG | обновляется редко, admin триггерит revalidate |
| `/about`, `/privacy`, `/cookies` | SSG | статические |
| `/admin/*` | Client-only, `noindex` | не индексировать |

### On-demand revalidation

При публикации/редактировании статьи из админки:
1. Go бэк отправляет `POST` на Next.js `/api/revalidate?secret=…`.
2. Next.js вызывает `revalidatePath('/blog/' + slug)` и `revalidateTag('articles')`.
3. Контент обновляется мгновенно, без ожидания ISR-window.

Секрет: env `NEXT_REVALIDATE_SECRET`. НЕ логировать.

---

## Metadata (Next.js App Router)

### Root layout (`app/layout.tsx`)

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://gta6-blog.ru'),
  title: {
    default: 'GTA6·БЛОГ — Vice City is coming',
    template: '%s · GTA6·БЛОГ',
  },
  description: 'Независимый хаб новостей о GTA VI. Утечки, разборы, теории — без хайпа и кликбейта.',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'GTA6·БЛОГ',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: '/', languages: { ru: '/' } },
};
```

### Страница статьи (`app/(public)/blog/[slug]/page.tsx`)

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await fetchArticle(params.slug);
  if (!article) return {};
  return {
    title: article.meta_title || article.title,
    description: article.meta_desc || article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt || '',
      publishedTime: article.published_at,
      authors: [article.author.name],
      images: [{ url: `/blog/${article.slug}/opengraph-image` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || '',
    },
  };
}
```

### `metadataBase`

ОБЯЗАТЕЛЬНО в root layout. Без него все относительные URL в OG/Twitter будут ломаться. Env: `NEXT_PUBLIC_SITE_URL`.

---

## Structured Data (JSON-LD)

Компонент `frontend/src/components/seo/StructuredData.tsx`:

```tsx
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

Хелперы в `frontend/src/lib/seo.ts`:

### Article schema (на страницах статей)

```ts
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",   // или "Article" для evergreen
  "headline": article.title,
  "description": article.excerpt,
  "image": [article.cover_image],
  "datePublished": article.published_at,
  "dateModified": article.updated_at,
  "author": { "@type": "Person", "name": article.author.name },
  "publisher": {
    "@type": "Organization",
    "name": "GTA6·БЛОГ",
    "logo": { "@type": "ImageObject", "url": "https://gta6-blog.ru/logo.png" }
  }
}
```

### WebSite + SearchAction (на главной)

```ts
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://gta6-blog.ru",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://gta6-blog.ru/blog?q={query}",
    "query-input": "required name=query"
  }
}
```

### BreadcrumbList (все вложенные страницы)

`Главная → Блог → [Название статьи]`.

### VideoObject (статьи с трейлером)

Если в статье встроен трейлер — добавить с `contentUrl`, `thumbnailUrl`, `duration`.

### Organization (root layout, глобально)

Один раз на весь сайт.

---

## App Router SEO-файлы

Все в `frontend/src/app/`:

### `sitemap.ts`

```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchAllPublishedArticles();
  return [
    { url: 'https://gta6-blog.ru', lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: 'https://gta6-blog.ru/blog', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: 'https://gta6-blog.ru/gallery', changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://gta6-blog.ru/about', changeFrequency: 'yearly', priority: 0.3 },
    ...articles.map(a => ({
      url: `https://gta6-blog.ru/blog/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

### `robots.ts`

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
      { userAgent: 'Yandex', allow: '/', disallow: ['/admin', '/api'] },  // явный allow для Яндекса
      { userAgent: 'Googlebot', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: 'https://gta6-blog.ru/sitemap.xml',
    host: 'https://gta6-blog.ru',
  };
}
```

### `manifest.ts` (PWA)

```ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GTA6·БЛОГ',
    short_name: 'GTA6·БЛОГ',
    description: '...',
    start_url: '/',
    display: 'standalone',
    background_color: '#0D0D0D',
    theme_color: '#0D0D0D',
    icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }],
  };
}
```

### `icon.tsx`, `apple-icon.tsx`

Фавиконки. Можно генерить через `next/og` `ImageResponse` — SVG-логотип на charcoal фоне.

### `opengraph-image.tsx`

Динамические OG для главной. Для статей — `app/(public)/blog/[slug]/opengraph-image.tsx` с `ImageResponse`, показывать: заголовок (Space Grotesk), категорию (mono, lime), логотип. Размер 1200×630.

---

## Core Web Vitals — правила

Обязательные бюджеты:

- **LCP < 2.5s** — hero-h1 виден без CLS
- **INP < 200ms** — hover / клик реагируют
- **CLS < 0.1** — шрифты через `next/font` (без FOIT), картинки с явными `width/height`

Как достигать:

- `next/image` для всех картинок (WebP/AVIF, lazy loading), кроме hero (`priority`).
- `next/font/google` с `display: swap` (уже настроен).
- Dynamic imports для тяжёлого: splash (только 1-й визит), exit-intent, admin компоненты, tiptap-редактор.
- RSC везде где возможно. Client boundary — минимально узкая.
- Streaming через `<Suspense>` для длинных страниц.
- Preload критичных ресурсов: `<link rel="preload" href="/api/stats/online" as="fetch">`.
- Не подключать analytics до onload (defer).

---

## СНГ SEO — Яндекс

**Обязательно:**

1. **Яндекс.Вебмастер**: подтверждение сайта (meta-тэг или HTML-файл в `public/`), submit sitemap, проверить robots.
2. **Google Search Console**: аналогично.
3. **Яндекс.Метрика**: подключить (после запуска, не в MVP-скелете).
4. **CDN с российскими edge-локациями**: Cloudflare (доступен) или BunnyCDN.
5. `<link rel="alternate" hreflang="ru" href="/">` в root layout — даже для одноязычного сайта.
6. Регистрация в **Яндекс.Новости** при 50+ опубликованных статьях.

**Специфика Яндекса:**
- Быстрее индексирует, но требовательнее к дублям. Canonical — must.
- Хорошо кушает JSON-LD `NewsArticle` и `Article`.
- Открытые og-теги обязательны (иначе Яндекс.Дзен не подхватит).

---

## Что НЕ индексировать

- `/admin/*` — через robots + `noindex` meta на layout админки.
- `/api/*` — robots.
- Draft-статьи — они физически не отдают HTML (404 если не published).
- Дублирующие фильтры `/blog?category=X` — canonical на `/blog`, `noindex` на пагинациях после первой (планируется).

---

## Чек-лист перед публикацией новой страницы

- [ ] `generateMetadata` (для динамических) или экспорт `metadata` (для статики)
- [ ] `canonical` в alternates
- [ ] OG image (если контент)
- [ ] Добавлена в `sitemap.ts`
- [ ] Проверить в Яндекс.Вебмастер / Search Console после deploy
- [ ] JSON-LD (если применимо: Article, VideoObject, BreadcrumbList)
- [ ] Lighthouse SEO ≥ 95

## СТАТУС (2026-09-03) — реализовано

- ✅ `metadataBase` + `title.template` в root layout
- ✅ `app/sitemap.ts` — динамический из БД, все статические роуты + все published статьи
- ✅ `app/robots.ts` — Yandex + Googlebot + `*`, disallow /admin + /api
- ✅ `app/manifest.ts` — PWA
- ✅ `lib/seo.ts` — helpers `articleJsonLd`, `websiteJsonLd`, `organizationJsonLd`
- ✅ `components/seo/StructuredData.tsx` — рендерит JSON-LD с escape `<`
- ✅ Article JSON-LD на `/blog/[slug]`, WebSite + Organization в root
- ✅ `generateMetadata` на статье с OG + Twitter card
- ⏳ Не сделано: `opengraph-image.tsx` (динамический OG-image через ImageResponse), on-demand revalidate webhook (внутрипроцессные Server Actions уже делают revalidatePath сами)
