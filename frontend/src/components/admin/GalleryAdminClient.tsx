"use client";

import { useRef, useState, useTransition } from "react";
import { createGalleryItem, deleteGalleryItem } from "@/app/admin/gallery/actions";

interface Item {
  id: string;
  imageUrl: string;
  caption: string | null;
  source: string;
  sortOrder: number;
}

const SOURCE_LABEL: Record<string, string> = {
  trailer: "Трейлер",
  screenshot: "Скриншот",
  leak: "Утечка",
  concept: "Концепт",
};

export function GalleryAdminClient({ items }: { items: Item[] }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string>("");
  const [remoteUrl, setRemoteUrl] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.code ?? "Не удалось загрузить");
      } else {
        setPendingUrl(data.url);
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onUrlFetch() {
    const url = remoteUrl.trim();
    if (!url) return;
    setError(null);
    setUploading(true);
    try {
      const res = await fetch("/api/admin/upload-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? data.code ?? "Не удалось скачать");
      } else {
        setPendingUrl(data.url);
        setRemoteUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createGalleryItem(fd);
      if (res.ok) {
        setPendingUrl("");
        formRef.current?.reset();
      } else {
        setError(res.error);
      }
    });
  }

  async function onDelete(id: string) {
    if (!confirm("Удалить изображение?")) return;
    startTransition(async () => {
      await deleteGalleryItem(id);
    });
  }

  return (
    <>
      <form
        ref={formRef}
        action={onSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr)",
          gap: 24,
          padding: 24,
          border: "1px solid var(--color-accent)",
          background: "rgba(212,255,0,0.04)",
          borderRadius: 2,
          marginBottom: 32,
        }}
        className="gallery-form"
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "var(--color-accent)",
              marginBottom: 12,
            }}
          >
            {"// "}ДОБАВИТЬ
          </div>
          {pendingUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pendingUrl}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "4 / 3",
                objectFit: "cover",
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "4 / 3",
                border: "1px dashed var(--color-border-default)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
              }}
            >
              НЕТ ИЗОБРАЖЕНИЯ
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            onChange={onFile}
            disabled={uploading}
            style={{
              marginTop: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-muted)",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <input
              type="url"
              placeholder="https://... из URL"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              disabled={uploading}
              style={{ ...inputStyle, fontSize: 12, padding: "8px 10px" }}
            />
            <button
              type="button"
              onClick={onUrlFetch}
              disabled={uploading || !remoteUrl.trim()}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                background: "transparent",
                color: "var(--color-accent)",
                border: "1px solid var(--color-accent)",
                borderRadius: 2,
                padding: "8px 10px",
                cursor: uploading || !remoteUrl.trim() ? "not-allowed" : "pointer",
                opacity: uploading || !remoteUrl.trim() ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              [URL]
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="imageUrl" value={pendingUrl} />
          <label style={fieldLabel}>
            Подпись
            <input
              name="caption"
              type="text"
              maxLength={200}
              placeholder="VICE BEACH · 3840×2160"
              style={inputStyle}
            />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12 }}>
            <label style={fieldLabel}>
              Источник
              <select name="source" defaultValue="screenshot" style={inputStyle}>
                {Object.entries(SOURCE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label style={fieldLabel}>
              Порядок
              <input
                name="sortOrder"
                type="number"
                defaultValue={items.length + 1}
                style={inputStyle}
              />
            </label>
          </div>
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
            disabled={isPending || !pendingUrl}
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.15em",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              border: "1px solid var(--color-accent)",
              borderRadius: 2,
              padding: "12px 22px",
              cursor: isPending || !pendingUrl ? "not-allowed" : "pointer",
              opacity: isPending || !pendingUrl ? 0.5 : 1,
              alignSelf: "flex-start",
              marginTop: "auto",
            }}
          >
            {isPending ? "…" : "[ДОБАВИТЬ →]"}
          </button>
        </div>
        <style>{`
          @media (max-width: 700px) {
            .gallery-form { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </form>

      {items.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            border: "1px dashed var(--color-border-default)",
            borderRadius: 2,
            color: "var(--color-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
          }}
        >
          Пока пусто.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.imageUrl}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: 2,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: "var(--color-muted)",
                }}
              >
                #{it.sortOrder} · {SOURCE_LABEL[it.source] ?? it.source}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--color-text)",
                  minHeight: 40,
                }}
              >
                {it.caption ?? "—"}
              </div>
              <button
                type="button"
                onClick={() => onDelete(it.id)}
                disabled={isPending}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  color: "var(--color-danger)",
                  background: "transparent",
                  border: "1px solid var(--color-danger)",
                  borderRadius: 2,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                УДАЛИТЬ
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const fieldLabel: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.18em",
  color: "var(--color-muted)",
  textTransform: "uppercase",
};

const inputStyle: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border-default)",
  borderRadius: 2,
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  padding: "10px 12px",
  width: "100%",
};
