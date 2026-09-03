import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Санитайз для пользовательского контента (комментарии).
 * Разрешён только минимальный whitelist — никаких классов, стилей, script.
 * Ссылки открываются в новой вкладке с rel=noopener.
 */
export function sanitizeComment(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ["p", "br", "strong", "em", "a", "blockquote", "code"],
    allowedAttributes: {
      a: ["href", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href"],
    disallowedTagsMode: "discard",
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener nofollow ugc",
        },
      }),
    },
  });
}
