import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/renderWithProviders";
import Menu from "../Menu";

describe("Menu", () => {
  const defaultProps = {
    onShowSettings: vi.fn(),
    onShowHowTo: vi.fn(),
    onReturnToSelection: vi.fn(),
  };

  it("renders all menu buttons", () => {
    renderWithProviders(<Menu {...defaultProps} />);
    // Menu has 4 buttons: toggle, settings, how-to-play, return-to-selection.
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it("calls onShowSettings when settings button is clicked", async () => {
    const user = userEvent.setup();
    const onShowSettings = vi.fn();
    renderWithProviders(
      <Menu {...defaultProps} onShowSettings={onShowSettings} />,
    );

    // The settings button contains the Settings icon.
    const buttons = screen.getAllByRole("button");
    // Settings is the second button (after menu toggle).
    await user.click(buttons[1]);

    expect(onShowSettings).toHaveBeenCalledTimes(1);
  });

  it("calls onShowHowTo when how-to-play button is clicked", async () => {
    const user = userEvent.setup();
    const onShowHowTo = vi.fn();
    renderWithProviders(
      <Menu {...defaultProps} onShowHowTo={onShowHowTo} />,
    );

    const buttons = screen.getAllByRole("button");
    // How-to-play is the third button.
    await user.click(buttons[2]);

    expect(onShowHowTo).toHaveBeenCalledTimes(1);
  });

  it("calls onReturnToSelection when return button is clicked", async () => {
    const user = userEvent.setup();
    const onReturnToSelection = vi.fn();
    renderWithProviders(
      <Menu {...defaultProps} onReturnToSelection={onReturnToSelection} />,
    );

    const buttons = screen.getAllByRole("button");
    // Return is the fourth button.
    await user.click(buttons[3]);

    expect(onReturnToSelection).toHaveBeenCalledTimes(1);
  });
});
