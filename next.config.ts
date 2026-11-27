import type { NextConfig } from "next";

/**
 * Chemin sous lequel le client web est servi. Sur l'EC2, Nginx sert le design system sur « / »,
 * l'API sur « /api/ » et ce client sur « /app/ » (docs/decisions/0003-chemin-app-sur-l-instance.md).
 * Fixé à la construction : changer la valeur impose de reconstruire l'image.
 */
const basePath = process.env.DELIBERA_BASE_PATH ?? "/app";

/** Version affichée dans le pied de page et renvoyée par /sante (commit, fourni par le pipeline). */
const version = process.env.DELIBERA_VERSION ?? "dev";

const enTetesDeSecurite = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Nginx ne doit pas mettre en mémoire tampon les réponses en flux (Suspense, streaming).
  { key: "X-Accel-Buffering", value: "no" },
];

const nextConfig: NextConfig = {
  basePath,
  // Serveur autonome (.next/standalone) : c'est ce que l'image Docker exécute.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Modèle de rendu de Next.js 16 (docs/decisions/0002-cache-components.md).
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_DELIBERA_VERSION: version,
  },
  async headers() {
    return [{ source: "/:path*", headers: enTetesDeSecurite }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
