import type { MetadataRoute } from "next";

// Web app manifest so iOS/Android "Add to Home Screen" installs Geometry as a
// standalone app with the real icon (CSP already allows manifest-src 'self').
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Geometry",
    short_name: "Geometry",
    description:
      "A friendly geometry playground for kids: study every 2D and 3D shape, learn its color, then beat the quiz at 3 levels.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff6ec",
    theme_color: "#fff6ec",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
