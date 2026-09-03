import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function AdminSubscribersPage() {
  const subs = await db.subscriber.findMany({
    orderBy: { subscribedAt: "desc" },
    take: 500,
    select: {
      id: true,
      email: true,
      confirmed: true,
      subscribedAt: true,
    },
  });
  const total = await db.subscriber.count();
  const confirmed = await db.subscriber.count({ where: { confirmed: true } });

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "var(--color-accent)",
            }}
          >
            {"// "}ПОДПИСЧИКОВ: {total} · ПОДТВЕРЖДЕНО: {confirmed}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: "-0.02em",
              margin: "12px 0 0",
            }}
          >
            Подписчики
          </h1>
        </div>
        <a
          href="/api/admin/subscribers.csv"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.15em",
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            padding: "14px 22px",
          }}
        >
          [→ ЭКСПОРТ CSV]
        </a>
      </div>

      {subs.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            border: "1px solid var(--color-border-default)",
            borderRadius: 2,
            color: "var(--color-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          Пока нет подписчиков.
        </div>
      ) : (
        <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 2 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 120px 200px",
              gap: 16,
              padding: "12px 20px",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: "var(--color-muted)",
              borderBottom: "1px solid var(--color-border-default)",
            }}
          >
            <div>EMAIL</div>
            <div>СТАТУС</div>
            <div>ПОДПИСАЛСЯ</div>
          </div>
          {subs.map((s) => (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 120px 200px",
                gap: 16,
                padding: "14px 20px",
                borderBottom: "1px solid var(--color-border-subtle)",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                }}
              >
                {s.email}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: s.confirmed
                    ? "var(--color-success)"
                    : "var(--color-muted)",
                }}
              >
                {s.confirmed ? "✓ активен" : "ожидает"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--color-muted)",
                }}
              >
                {dateFmt.format(new Date(s.subscribedAt))}
              </div>
            </div>
          ))}
          {total > subs.length && (
            <div
              style={{
                padding: "16px 20px",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--color-muted)",
              }}
            >
              Показаны последние {subs.length} из {total} — выгрузи CSV для
              полного списка.
            </div>
          )}
        </div>
      )}
    </>
  );
}
