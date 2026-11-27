import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/lib/routes";

import { NavigationLaterale } from "./navigation-laterale";

vi.mock("next/navigation", () => ({ usePathname: () => "/deliberations/12" }));

describe("NavigationLaterale", () => {
  it("n'affiche que les entrées autorisées, groupées", () => {
    // Étant donné un utilisateur qui n'a accès qu'à l'accueil et aux délibérations
    render(<NavigationLaterale hrefs={[ROUTES.accueil, ROUTES.deliberations]} />);
    // Alors
    expect(screen.getByRole("link", { name: "Tableau de bord" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Délibérations" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Utilisateurs" })).not.toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  it("signale la page en cours, y compris sur une sous-page", () => {
    render(<NavigationLaterale hrefs={[ROUTES.accueil, ROUTES.deliberations]} />);
    expect(screen.getByRole("link", { name: "Délibérations" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Tableau de bord" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
