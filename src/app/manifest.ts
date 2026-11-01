import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HTML Anything",
    short_name: "HTML Anything",
    description:
      "Markdown is the draft; HTML is what humans read. Your AI agent writes HTML directly.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#faf9f7",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
