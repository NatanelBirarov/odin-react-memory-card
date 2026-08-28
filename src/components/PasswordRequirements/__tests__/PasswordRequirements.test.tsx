import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PasswordRequirements from "../PasswordRequirements";

const allMet = {
  hasCorrectLength: true,
  hasUpperCase: true,
  hasLowerCase: true,
  hasNumber: true,
  hasSpecialChar: true,
};

const noneMet = {
  hasCorrectLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false,
  hasSpecialChar: false,
};

describe("PasswordRequirements", () => {
  it("renders all requirement labels", () => {
    render(<PasswordRequirements requirements={noneMet} />);

    expect(screen.getByText("Between 6 and 12 characters")).toBeInTheDocument();
    expect(screen.getByText("One uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("One lowercase letter")).toBeInTheDocument();
    expect(screen.getByText("One number")).toBeInTheDocument();
    expect(screen.getByText("One special character")).toBeInTheDocument();
  });

  it("sets data-met=true when all requirements are met", () => {
    render(<PasswordRequirements requirements={allMet} />);

    const requirements = document.querySelectorAll("[data-met='true']");
    expect(requirements).toHaveLength(5);
  });

  it("sets data-met=false when no requirements are met", () => {
    render(<PasswordRequirements requirements={noneMet} />);

    const requirements = document.querySelectorAll("[data-met='false']");
    expect(requirements).toHaveLength(5);
  });

  it("reflects individual requirement states", () => {
    const partial = {
      hasCorrectLength: true,
      hasUpperCase: false,
      hasLowerCase: true,
      hasNumber: false,
      hasSpecialChar: false,
    };
    render(<PasswordRequirements requirements={partial} />);

    const metReqs = document.querySelectorAll("[data-met='true']");
    const unmetReqs = document.querySelectorAll("[data-met='false']");
    expect(metReqs).toHaveLength(2);
    expect(unmetReqs).toHaveLength(3);
  });
});
