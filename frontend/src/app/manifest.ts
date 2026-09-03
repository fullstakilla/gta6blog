import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GTA6·БЛОГ",
    short_name: "GTA6·БЛОГ",
    description:
      "Независимый хаб новостей о GTA VI. Утечки, разборы, теории — без хайпа и кликбейта.",
    start_url: "/",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#0D0D0D",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
