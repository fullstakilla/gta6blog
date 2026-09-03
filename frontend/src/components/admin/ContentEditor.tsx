"use client";

import { useEffect, useState } from "react";
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";
import { ru } from "@blocknote/core/locales";
import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface Props {
  initialMarkdown: string;
  hiddenInputName?: string;
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.message ?? data.code ?? "Ошибка загрузки картинки");
  }
  return data.url as string;
}

const schema = BlockNoteSchema.create({ blockSpecs: defaultBlockSpecs });

export default function ContentEditor({
  initialMarkdown,
  hiddenInputName = "content",
}: Props) {
  const [ready, setReady] = useState(false);

  const editor = useCreateBlockNote({
    schema,
    uploadFile,
    dictionary: ru,
  });

  // одноразовая инициализация — парсим MD → блоки → грузим в редактор
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (initialMarkdown.trim()) {
        try {
          const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
          if (!cancelled && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
          }
        } catch (e) {
          console.warn("BlockNote: не удалось распарсить исходный markdown", e);
        }
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function syncHidden() {
    try {
      const md = await editor.blocksToMarkdownLossy(editor.document);
      const hidden = document.querySelector<HTMLInputElement>(
        `input[type="hidden"][name="${hiddenInputName}"]`,
      );
      if (hidden) hidden.value = md;
    } catch (e) {
      console.warn("BlockNote → markdown ошибка", e);
    }
  }

  return (
    <div className="content-editor-wrap">
      <input type="hidden" name={hiddenInputName} defaultValue={initialMarkdown} />
      <BlockNoteView
        editor={editor}
        theme="dark"
        onChange={syncHidden}
        slashMenu={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) =>
            filterSuggestionItems(getDefaultReactSlashMenuItems(editor), query)
          }
        />
      </BlockNoteView>
      {!ready && (
        <div
          style={{
            padding: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          инициализация…
        </div>
      )}
      <style>{`
        .content-editor-wrap { border: 1px solid var(--color-border-default); border-radius: 2px; background: var(--color-bg); }
        .content-editor-wrap .bn-container { background: var(--color-bg) !important; }
        .content-editor-wrap [data-theme="dark"] {
          --bn-colors-editor-background: var(--color-bg);
          --bn-colors-editor-text: var(--color-text);
          --bn-colors-menu-background: var(--color-surface);
          --bn-colors-menu-text: var(--color-text);
          --bn-colors-tooltip-background: var(--color-elevated);
          --bn-colors-tooltip-text: var(--color-text);
          --bn-colors-hovered-background: var(--color-elevated);
          --bn-colors-hovered-text: var(--color-accent);
          --bn-colors-selected-background: rgba(212, 255, 0, 0.08);
          --bn-colors-selected-text: var(--color-accent);
          --bn-colors-disabled-background: var(--color-surface);
          --bn-colors-disabled-text: var(--color-muted);
          --bn-colors-shadow: rgba(0, 0, 0, 0.6);
          --bn-colors-border: var(--color-border-default);
          --bn-colors-side-menu: var(--color-muted);
          --bn-colors-highlights-gray-background: var(--color-elevated);
          --bn-font-family: var(--font-body);
        }
        .content-editor-wrap .bn-editor { padding: 20px 24px; min-height: 340px; }
        .content-editor-wrap .bn-block-content h1 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; }
        .content-editor-wrap .bn-block-content h2 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; }
        .content-editor-wrap .bn-block-content h3 { font-family: var(--font-display); font-weight: 700; letter-spacing: -0.02em; }
      `}</style>
    </div>
  );
}
