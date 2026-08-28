import { describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/renderWithProviders";
import SignInPage from "../SignInPage";

// Mock ApiClient to avoid real network calls.
vi.mock("../../../scripts/apiClient", () => ({
  default: {
    signInWithOTP: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
    verifyOTP: vi.fn().mockResolvedValue({ data: { success: true }, error: null }),
  },
}));

// Mock authClient (imported transitively by apiClient).
vi.mock("../../../scripts/authClient", () => ({
  authClient: {
    signUp: { email: vi.fn() },
    emailOtp: { sendVerificationOtp: vi.fn() },
    signIn: { emailOtp: vi.fn(), email: vi.fn() },
  },
}));

describe("SignInPage", () => {
  it("renders the email form initially", () => {
    renderWithProviders(<SignInPage />);

    expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders sign-up link", () => {
    renderWithProviders(<SignInPage />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("shows validation error for empty email on submit", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInPage />);

    // Click the Sign In button without entering email.
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid email on submit", async () => {
    renderWithProviders(<SignInPage />);

    const emailInput = screen.getByRole("textbox");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    });
  });

  it("transitions to OTP view after successful email submission", async () => {
    const user = userEvent.setup();
    const { default: ApiClient } = await import(
      "../../../scripts/apiClient"
    );
    vi.mocked(ApiClient.signInWithOTP).mockResolvedValue({
      data: { success: true },
      error: null,
    } as any);

    renderWithProviders(<SignInPage />);

    const emailInput = screen.getByRole("textbox");
    await user.type(emailInput, "test@example.com");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(
        screen.getByText("Enter Verification Code"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("shows 'Sending Code...' while request is pending", async () => {
    const user = userEvent.setup();
    const { default: ApiClient } = await import(
      "../../../scripts/apiClient"
    );
    // Make the request hang.
    vi.mocked(ApiClient.signInWithOTP).mockReturnValue(new Promise(() => {}));

    renderWithProviders(<SignInPage />);

    const emailInput = screen.getByRole("textbox");
    await user.type(emailInput, "test@example.com");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Sending Code...")).toBeInTheDocument();
    });
  });
});
