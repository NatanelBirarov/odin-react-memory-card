import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/renderWithProviders";
import SettingsPage from "../SettingsPage";

describe("SettingsPage", () => {
  it("renders music and SFX volume labels", () => {
    renderWithProviders(<SettingsPage onClose={vi.fn()} />);

    expect(screen.getByText("Music volume")).toBeInTheDocument();
    expect(screen.getByText("SFX volume")).toBeInTheDocument();
  });

  it("renders volume sliders", () => {
    renderWithProviders(<SettingsPage onClose={vi.fn()} />);

    expect(screen.getByLabelText("Music volume")).toBeInTheDocument();
    expect(screen.getByLabelText("SFX volume")).toBeInTheDocument();
  });

  it("renders close button", () => {
    renderWithProviders(<SettingsPage onClose={vi.fn()} />);
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderWithProviders(<SettingsPage onClose={onClose} />);
    await user.click(screen.getByText("Close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders clear game data button", () => {
    renderWithProviders(<SettingsPage onClose={vi.fn()} />);
    expect(screen.getByText("Clear game data")).toBeInTheDocument();
  });

  it("renders sliders with initial value of 50 (default 0.5 volume)", () => {
    renderWithProviders(<SettingsPage onClose={vi.fn()} />);

    const musicSlider = screen.getByLabelText("Music volume") as HTMLInputElement;
    const sfxSlider = screen.getByLabelText("SFX volume") as HTMLInputElement;

    expect(musicSlider.value).toBe("50");
    expect(sfxSlider.value).toBe("50");
  });
});
