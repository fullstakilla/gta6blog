import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О проекте",
  description:
    "GTA6·БЛОГ — независимый хаб новостей о GTA VI. Утечки, разборы, теории — без хайпа и кликбейта.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "56px 24px 96px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.25em",
          color: "var(--color-accent)",
        }}
      >
        {"// "}О ПРОЕКТЕ
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(40px, 5.4vw, 64px)",
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          margin: "24px 0 0",
        }}
      >
        Без хайпа. Без кликбейта. Editorial.
      </h1>

      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 18,
          lineHeight: 1.65,
          color: "var(--color-text)",
          marginTop: 40,
        }}
      >
        <p>
          GTA6·БЛОГ — независимый новостной хаб о GTA VI на русском языке. Мы
          следим за каждым шагом Rockstar к релизу и разбираем всё, что стоит
          вашего внимания: утечки, трейлеры, теории и подтверждённые факты.
        </p>
        <p>
          Мы не публикуем то, чего не читали сами. Не переводим reddit-треды
          построчно, не разгоняем слухи ради кликов и не собираем «10 фактов,
          которые вас удивят». Если новость важная — расскажем подробно. Если
          нет — не расскажем вовсе.
        </p>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.02em",
            margin: "48px 0 16px",
          }}
        >
          Что тут есть
        </h2>
        <ul style={{ paddingLeft: 24, margin: "0 0 20px" }}>
          <li>Ежедневные новости — разборы трейлеров, утечки, слухи</li>
          <li>«Всё, что известно о GTA VI» — evergreen-гид, обновляется</li>
          <li>Галерея — скриншоты, концепты, трейлер-кадры</li>
          <li>Обратный отсчёт до релиза 26 мая 2026</li>
        </ul>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.02em",
            margin: "48px 0 16px",
          }}
        >
          Контакты
        </h2>
        <p>
          Пишите на{" "}
          <a
            href="mailto:hello@gta6-blog.ru"
            style={{
              color: "var(--color-accent)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            hello@gta6-blog.ru
          </a>
          . Инсайдам гарантируем анонимность.
        </p>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
            marginTop: 48,
          }}
        >
          НЕОФИЦИАЛЬНЫЙ ФАН-САЙТ. GTA VI © ROCKSTAR GAMES & TAKE-TWO
          INTERACTIVE.
        </p>
      </div>
    </article>
  );
}
