"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createArticle, updateArticle, deleteArticle } from "@/app/admin/articles/actions";

const ContentEditor = dynamic(() => import("./ContentEditor"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        border: "1px solid var(--color-border-default)",
        borderRadius: 2,
        minHeight: 380,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.16em",
      }}
    >
      загружаем редактор…
    </div>
  ),
});

const CATEGORIES = [
  "TRAILER",
  "LEAK",
  "MAP",
  "CHARACTER",
  "GAMEPLAY",
  "RUMOR",
] as const;

const CATEGORY_LABEL: Record<(typeof CATEGORIES)[number], string> = {
  TRAILER: "Трейлер",
  LEAK: "Утечка",
  MAP: "Карта",
  CHARACTER: "Персонаж",
  GAMEPLAY: "Геймплей",
  RUMOR: "Слух",
};

const STATUSES = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликовать" },
  { value: "archived", label: "Архив" },
] as const;

export interface ArticleFormValues {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  coverCaption?: string | null;
  category?: (typeof CATEGORIES)[number];
  tags?: string[];
  status?: "draft" | "published" | "archived";
  metaTitle?: string | null;
  metaDesc?: string | null;
  isFeatured?: boolean;
}

interface Props {
  mode: "create" | "edit";
  initial?: ArticleFormValues;
  currentFeaturedTitle?: string | null;
}

export function ArticleForm({ mode, initial = {}, currentFeaturedTitle }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>(initial.coverImage ?? "");
  const [uploading, setUploading] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
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
        setError(data.message ?? data.code ?? "Не удалось загрузить файл");
      } else {
        setCoverUrl(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        setCoverUrl(data.url);
        setRemoteUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(formData: FormData) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      if (mode === "create") {
        const res = await createArticle(formData);
        if (res && !res.ok) setError(res.error);
        // при успехе Server Action делает redirect
      } else if (initial.id) {
        const res = await updateArticle(initial.id, formData);
        if (res && !res.ok) setError(res.error);
        else setNotice("Сохранено");
      }
    });
  }

  async function onDelete() {
    if (!initial.id) return;
    if (!confirm("Удалить статью безвозвратно?")) return;
    startTransition(async () => {
      await deleteArticle(initial.id!);
      // redirect в action
    });
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div>
          <Link
            href="/admin"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-muted)",
            }}
          >
            ← ко всем статьям
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: "-0.02em",
              margin: "12px 0 0",
            }}
          >
            {mode === "create" ? "Новая статья" : "Редактирование"}
          </h1>
        </div>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "var(--color-danger)",
              background: "transparent",
              border: "1px solid var(--color-danger)",
              borderRadius: 2,
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            [УДАЛИТЬ]
          </button>
        )}
      </div>

      <form action={onSubmit} style={{ display: "grid", gap: 20, maxWidth: 900 }}>
        <Field label="Заголовок">
          <input
            name="title"
            required
            defaultValue={initial.title ?? ""}
            style={inputStyle}
          />
        </Field>

        <Field label="Slug (URL). Оставь пустым — сгенерится из заголовка.">
          <input
            name="slug"
            defaultValue={initial.slug ?? ""}
            placeholder="latest-vice-city-leak"
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Field label="Категория">
            <select
              name="category"
              defaultValue={initial.category ?? "TRAILER"}
              style={inputStyle}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Статус">
            <select
              name="status"
              defaultValue={initial.status ?? "draft"}
              style={inputStyle}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Теги (через запятую)">
          <input
            name="tags"
            defaultValue={initial.tags?.join(", ") ?? ""}
            placeholder="vice-city, trailer-2, lucia"
            style={inputStyle}
          />
        </Field>

        <Field label="Обложка">
          <input type="hidden" name="coverImage" value={coverUrl} />
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt=""
              style={{
                width: 260,
                aspectRatio: "3 / 4",
                objectFit: "cover",
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
                background: "var(--color-surface)",
              }}
            />
          )}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={onFilePicked}
              disabled={uploading}
              style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-muted)" }}
            />
            {uploading && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-muted)" }}>
                загружаем…
              </span>
            )}
            {coverUrl && !uploading && (
              <button
                type="button"
                onClick={() => setCoverUrl("")}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "var(--color-danger)",
                  background: "transparent",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: 2,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                убрать
              </button>
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-muted)",
                letterSpacing: "0.14em",
              }}
            >
              jpg/png/webp/avif · до 8 MB
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
            <input
              type="url"
              placeholder="https://... — загрузить обложку из URL"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              disabled={uploading}
              style={{ ...inputStyle, flex: 1, minWidth: 280, fontSize: 12 }}
            />
            <button
              type="button"
              onClick={onUrlFetch}
              disabled={uploading || !remoteUrl.trim()}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                background: "transparent",
                color: "var(--color-accent)",
                border: "1px solid var(--color-accent)",
                borderRadius: 2,
                padding: "10px 14px",
                cursor: uploading || !remoteUrl.trim() ? "not-allowed" : "pointer",
                opacity: uploading || !remoteUrl.trim() ? 0.5 : 1,
              }}
            >
              [ЗАГРУЗИТЬ URL]
            </button>
          </div>
        </Field>

        <Field label="Подпись к обложке (источник, тайминг — необязательно)">
          <input
            name="coverCaption"
            defaultValue={initial.coverCaption ?? ""}
            placeholder="Кадр: GTA VI Trailer 2, 0:47"
            maxLength={200}
            style={inputStyle}
          />
        </Field>

        <Field label="Excerpt (краткое описание, до 300 символов)">
          <textarea
            name="excerpt"
            rows={2}
            defaultValue={initial.excerpt ?? ""}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>

        <Field label="Контент">
          <ContentEditor initialMarkdown={initial.content ?? ""} />
        </Field>

        <details style={{ border: "1px solid var(--color-border-default)", borderRadius: 2, padding: 16 }}>
          <summary style={{ cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.14em", color: "var(--color-muted)" }}>
            SEO OVERRIDE
          </summary>
          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <Field label="Meta title">
              <input
                name="metaTitle"
                defaultValue={initial.metaTitle ?? ""}
                style={inputStyle}
              />
            </Field>
            <Field label="Meta description">
              <textarea
                name="metaDesc"
                rows={2}
                defaultValue={initial.metaDesc ?? ""}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </Field>
          </div>
        </details>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: 16,
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            background: "rgba(212,255,0,0.04)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={initial.isFeatured ?? false}
            style={{ marginTop: 2 }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.14em",
                color: "var(--color-accent)",
              }}
            >
              ★ ПОКАЗАТЬ В HERO ГЛАВНОЙ
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--color-muted)",
                marginTop: 6,
              }}
            >
              Заменит текущую hero-статью. Одновременно только одна статья
              может быть featured.
              {currentFeaturedTitle && (
                <>
                  {" "}Сейчас в hero: <b>{currentFeaturedTitle}</b>.
                </>
              )}
            </div>
          </div>
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
            Ошибка: {error}
          </div>
        )}
        {notice && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-success)",
            }}
          >
            ✓ {notice}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
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
              padding: "14px 22px",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {isPending ? "…" : mode === "create" ? "[СОЗДАТЬ →]" : "[СОХРАНИТЬ →]"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.15em",
              background: "transparent",
              color: "var(--color-text)",
              border: "1px solid var(--color-border-default)",
              borderRadius: 2,
              padding: "14px 22px",
              cursor: "pointer",
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "var(--color-muted)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border-default)",
  borderRadius: 2,
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  padding: "12px 14px",
  width: "100%",
};
