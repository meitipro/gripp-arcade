import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "Gripp Arcade", short_name: "Gripp", description: "Twenty small games for the PrismaX community (unofficial).", start_url: "/", display: "standalone", background_color: "#F4F1EC", theme_color: "#202020", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }] };
}
