import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Какие cookie использует GTA6·БЛОГ и зачем.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
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
        Cookies
      </h1>

      <p>
        Сайт использует минимум cookies и localStorage. Ничего, что уникально
        идентифицирует вас как личность.
      </p>

      <h2 style={h2}>Необходимые (используются всегда)</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={th}>Ключ</th>
            <th style={th}>Где</th>
            <th style={th}>Зачем</th>
            <th style={th}>Срок</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={td}>gta6_session</td>
            <td style={td}>cookie</td>
            <td style={td}>Сессия администратора в /admin</td>
            <td style={td}>7 дней</td>
          </tr>
          <tr>
            <td style={td}>gta6_cookieConsent</td>
            <td style={td}>localStorage</td>
            <td style={td}>Отметка о согласии с этим баннером</td>
            <td style={td}>365 дней</td>
          </tr>
          <tr>
            <td style={td}>gta6_firstVisit</td>
            <td style={td}>localStorage</td>
            <td style={td}>Флаг, что сплэш-скрин уже показывался</td>
            <td style={td}>Бессрочно</td>
          </tr>
          <tr>
            <td style={td}>gta6_miniClosed</td>
            <td style={td}>state</td>
            <td style={td}>Юзер закрыл мини-таймер (в текущей сессии)</td>
            <td style={td}>Сессия</td>
          </tr>
          <tr>
            <td style={td}>gta6_subscribed</td>
            <td style={td}>localStorage</td>
            <td style={td}>Уже подписан — не показывать exit-intent</td>
            <td style={td}>Бессрочно</td>
          </tr>
        </tbody>
      </table>

      <h2 style={h2}>Аналитика</h2>
      <p>
        На момент публикации сайт не подключён к внешним аналитическим
        сервисам. При подключении Яндекс.Метрики или подобного — обновим
        страницу и добавим переключатель в баннере.
      </p>

      <h2 style={h2}>Как отключить</h2>
      <p>
        Cookies и localStorage можно очистить через настройки браузера. Учтите,
        что сайт перестанет помнить ваши предпочтения (например, сплэш будет
        показываться снова).
      </p>
    </article>
  );
}

const h2: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 22,
  letterSpacing: "-0.02em",
  margin: "40px 0 16px",
};
const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  margin: "0 0 16px",
  fontSize: 14,
};
const th: React.CSSProperties = {
  textAlign: "left",
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.18em",
  color: "var(--color-muted)",
  padding: "10px 12px",
  borderBottom: "1px solid var(--color-border-default)",
};
const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid var(--color-border-subtle)",
  verticalAlign: "top",
};
