import { describe, it, expect } from "vitest";
import { renderWithProviders } from "../../../test/renderWithProviders";
import Loader from "../Loader";

describe("Loader", () => {
  it("renders without crashing", () => {
    const { container } = renderWithProviders(<Loader />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders the pokeball loader image", () => {
    const { container } = renderWithProviders(<Loader />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Loader");
  });
});
