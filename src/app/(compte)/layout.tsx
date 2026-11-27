import { BrandLogo } from "@/components/ui/brand-logo";
import { LinearBackground } from "@/components/ui/linear-background";

/** Pages du compte hors de la coquille : changement de mot de passe imposé à la première connexion. */
export default function CompteLayout({ children }: LayoutProps<"/">) {
  return (
    <LinearBackground className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 py-10">
      <BrandLogo name="Delibera" size="lg" />
      <main className="w-full max-w-sm">{children}</main>
      <p className="text-xs text-fg-tertiary">
        Plateforme de délibération des étudiants · version {process.env.NEXT_PUBLIC_DELIBERA_VERSION}
      </p>
    </LinearBackground>
  );
}
