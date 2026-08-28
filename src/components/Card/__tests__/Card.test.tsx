import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/renderWithProviders";
import Card from "../Card";

describe("Card", () => {
  const defaultProps = {
    name: "Pikachu",
    image: "/images/pikachu.png",
    isShuffling: false,
    onClick: vi.fn(),
  };

  it("renders card with alt text for card images", () => {
    renderWithProviders(<Card {...defaultProps} />);
    expect(screen.getByAltText("Pikachu-front")).toBeInTheDocument();
    expect(screen.getByAltText("Pikachu-back")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    renderWithProviders(<Card {...defaultProps} onClick={handleClick} />);
    await user.click(screen.getByAltText("Pikachu-front"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders card back image", () => {
    renderWithProviders(<Card {...defaultProps} />);
    const backImage = screen.getByAltText("Pikachu-back");
    expect(backImage).toHaveAttribute("src", "/images/card-back.png");
  });
});
