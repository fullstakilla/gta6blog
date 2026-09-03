"use client";

import { useState, useTransition } from "react";
import { login } from "../auth/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await login(formData);
      if (res && !res.ok) {
        setError(
          res.code === "INVALID_CREDENTIALS"
            ? "Неверный email или пароль"
            : "Проверь поля формы",
        );
      }
    });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-surface)",
          border: "1px solid var(--color-border-default)",
          borderRadius: 2,
          padding: 32,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
            marginBottom: 16,
          }}
        >
          {"// "}АДМИНКА
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "-0.02em",
            margin: "0 0 24px",
          }}
        >
          Вход
        </h1>
        <form action={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={labelStyle}>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              defaultValue="admin@gta6blog.ru"
              style={inputStyle}
            />
          </label>
          <label style={labelStyle}>
            Пароль
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </label>
          {error && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isPending}
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.15em",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              border: "1px solid var(--color-accent)",
              borderRadius: 2,
              padding: "14px 20px",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.5 : 1,
              marginTop: 12,
            }}
          >
            {isPending ? "…" : "[ВОЙТИ →]"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 8,
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.18em",
  color: "var(--color-muted)",
  textTransform: "uppercase" as const,
};

const inputStyle = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border-default)",
  borderRadius: 2,
  color: "var(--color-text)",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  padding: "12px 14px",
};
