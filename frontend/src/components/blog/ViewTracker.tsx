"use client";

import { useEffect } from "react";
import { trackView } from "@/app/(public)/blog/[slug]/actions";

export function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    // fire-and-forget; сервер сам дедуплицирует по ipHash + окну 10 мин
    trackView({ articleId }).catch(() => {});
  }, [articleId]);
  return null;
}
