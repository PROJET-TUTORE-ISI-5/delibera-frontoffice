import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// « server-only » refuse d'être importé hors d'un Server Component : neutre dans les tests.
vi.mock("server-only", () => ({}));

afterEach(() => cleanup());
