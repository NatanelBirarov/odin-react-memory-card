import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Score from "../Scores";

describe("Scores", () => {
  it("displays current score", () => {
    render(<Score currentScore={5} highScore={10} />);
    expect(screen.getByText(/^Score:5$/)).toBeInTheDocument();
  });

  it("displays high score", () => {
    render(<Score currentScore={5} highScore={10} />);
    expect(screen.getByText(/^High Score:10$/)).toBeInTheDocument();
  });

  it("displays zero values", () => {
    render(<Score currentScore={0} highScore={0} />);
    expect(screen.getByText(/^Score:0$/)).toBeInTheDocument();
    expect(screen.getByText(/^High Score:0$/)).toBeInTheDocument();
  });
});
