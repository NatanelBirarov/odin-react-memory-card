import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/renderWithProviders";
import NotFoundPage from "../NotFoundPage";

describe("NotFoundPage", () => {
  it("renders 404 code", () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders page not found title", () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders descriptive message", () => {
    renderWithProviders(<NotFoundPage />);
    expect(screen.getByText(/wild 404 appeared/i)).toBeInTheDocument();
  });

  it("renders return button", () => {
    renderWithProviders(<NotFoundPage />);
    expect(
      screen.getByText("Return to Title Page"),
    ).toBeInTheDocument();
  });
});
