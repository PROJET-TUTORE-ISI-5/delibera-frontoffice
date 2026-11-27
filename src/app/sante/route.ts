/**
 * Sonde de santé du client web : utilisée par le HEALTHCHECK de l'image Docker, le script de
 * déploiement sur l'EC2 et le pipeline. Elle ne dépend pas de l'API : le client web peut être en
 * service même si l'API redémarre.
 */
export function GET() {
  return Response.json(
    { status: "UP", application: "delibera-frontoffice", version: process.env.NEXT_PUBLIC_DELIBERA_VERSION ?? "dev" },
    { headers: { "cache-control": "no-store" } },
  );
}
