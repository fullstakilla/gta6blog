import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Как GTA6·БЛОГ обрабатывает персональные данные пользователей.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "56px 24px 96px",
        fontFamily: "var(--font-body)",
        fontSize: 16,
        lineHeight: 1.65,
        color: "var(--color-text)",
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
        {"// "}ЛЕГАЛ
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(32px, 4.4vw, 48px)",
          lineHeight: 1.1,
          letterSpacing: "-0.035em",
          margin: "20px 0 40px",
        }}
      >
        Политика конфиденциальности
      </h1>

      <p style={{ color: "var(--color-muted)", fontSize: 13, marginBottom: 32 }}>
        Действует с 3 сентября 2026 года.
      </p>

      <Section title="1. Кто мы">
        <p>
          Оператор — редакция GTA6·БЛОГ, независимый фан-сайт. Не является
          юридическим лицом. Контакт: hello@gta6-blog.ru.
        </p>
      </Section>

      <Section title="2. Какие данные мы собираем">
        <ul>
          <li>
            <b>Email</b> — если вы подписываетесь на рассылку. Только с явного
            согласия.
          </li>
          <li>
            <b>Имя и email</b> — если вы оставляете комментарий. Email
            необязателен и не публикуется.
          </li>
          <li>
            <b>Хэш IP-адреса</b> — для защиты от спама и злоупотреблений.
            Хранится как SHA-256 от IP+соли, восстановить исходный IP из хэша
            невозможно.
          </li>
          <li>
            <b>Технические данные</b> — тип браузера, устройство, referer,
            обезличенно, только для аналитики.
          </li>
        </ul>
      </Section>

      <Section title="3. Для чего мы используем данные">
        <ul>
          <li>Email — только для рассылки, на которую вы подписались.</li>
          <li>Имя — для отображения авторства комментария.</li>
          <li>Хэш IP — антиспам и rate-limiting.</li>
          <li>
            Обезличенная статистика — для понимания, что читают, и улучшения
            сайта.
          </li>
        </ul>
        <p>
          <b>Мы никогда не передаём и не продаём</b> ваши данные третьим лицам.
        </p>
      </Section>

      <Section title="4. Сроки хранения">
        <ul>
          <li>Email подписки — пока вы не отпишетесь.</li>
          <li>Комментарии — бессрочно, пока не будут удалены модератором или вами.</li>
          <li>Хэши IP в комментариях/реакциях — 90 дней.</li>
          <li>Обезличенная аналитика — 24 месяца.</li>
        </ul>
      </Section>

      <Section title="5. Ваши права">
        <p>По 152-ФЗ «О персональных данных» вы можете:</p>
        <ul>
          <li>Отписаться от рассылки в любой момент (ссылка в каждом письме).</li>
          <li>
            Попросить удалить ваш комментарий или email — напишите на
            hello@gta6-blog.ru.
          </li>
          <li>Получить копию хранимых о вас данных по запросу.</li>
        </ul>
      </Section>

      <Section title="6. Cookies">
        <p>
          Мы используем cookies для базовой работы сайта (сохранение вашего
          согласия с cookie-баннером, отметка «сплэш-скрин уже показывался»).
          Подробнее — в{" "}
          <a href="/cookies" style={linkStyle}>
            политике cookies
          </a>
          .
        </p>
      </Section>

      <Section title="7. Изменения политики">
        <p>
          Мы можем обновлять политику. Дата действия сверху страницы всегда
          отражает актуальную версию.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: "-0.02em",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

const linkStyle: React.CSSProperties = {
  color: "var(--color-accent)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};
