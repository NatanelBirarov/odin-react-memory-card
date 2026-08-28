import { describe, it, expect } from "vitest";
import {
  PASSWORD_REGEX,
  formSchema,
  signInFormSchema,
  signInOTPFormSchema,
} from "../validationSchemas";

describe("PASSWORD_REGEX", () => {
  it("accepts minimum valid password (6 chars, all rules)", () => {
    expect(PASSWORD_REGEX.test("Aa1@bb")).toBe(true);
  });

  it("accepts maximum valid password (12 chars)", () => {
    expect(PASSWORD_REGEX.test("Aa1@bbccddee")).toBe(true);
  });

  it("rejects password exceeding 12 chars", () => {
    expect(PASSWORD_REGEX.test("Aa1@bbbbbbbbb")).toBe(false);
  });

  it("rejects password below 6 chars", () => {
    expect(PASSWORD_REGEX.test("Aa1@b")).toBe(false);
  });

  it("rejects password without uppercase", () => {
    expect(PASSWORD_REGEX.test("aa1@bbcc")).toBe(false);
  });

  it("rejects password without lowercase", () => {
    expect(PASSWORD_REGEX.test("AA1@BBCC")).toBe(false);
  });

  it("rejects password without digit", () => {
    expect(PASSWORD_REGEX.test("Aaa@bbcc")).toBe(false);
  });

  it("rejects password without special character", () => {
    expect(PASSWORD_REGEX.test("Aa1bbbcc")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(PASSWORD_REGEX.test("")).toBe(false);
  });
});

describe("formSchema (Sign Up)", () => {
  const validData = {
    username: "TestUser",
    email: "test@example.com",
    password: "Aa1@bb",
    confirmPassword: "Aa1@bb",
    image: undefined,
  };

  it("accepts valid complete submission", () => {
    const result = formSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = formSchema.safeParse({
      ...validData,
      confirmPassword: "Different1@",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = formSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username shorter than 3 characters", () => {
    const result = formSchema.safeParse({
      ...validData,
      username: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username longer than 20 characters", () => {
    const result = formSchema.safeParse({
      ...validData,
      username: "a".repeat(21),
    });
    expect(result.success).toBe(false);
  });

  it("accepts submission without image (optional)", () => {
    const result = formSchema.safeParse({ ...validData, image: undefined });
    expect(result.success).toBe(true);
  });

  it("rejects weak password", () => {
    const result = formSchema.safeParse({
      ...validData,
      password: "weak",
      confirmPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("signInFormSchema", () => {
  it("accepts valid email", () => {
    const result = signInFormSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signInFormSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = signInFormSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

describe("signInOTPFormSchema", () => {
  it("accepts valid 6-digit OTP", () => {
    const result = signInOTPFormSchema.safeParse({
      digit1: "1",
      digit2: "2",
      digit3: "3",
      digit4: "4",
      digit5: "5",
      digit6: "6",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-digit character", () => {
    const result = signInOTPFormSchema.safeParse({
      digit1: "a",
      digit2: "2",
      digit3: "3",
      digit4: "4",
      digit5: "5",
      digit6: "6",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty string in any position", () => {
    const result = signInOTPFormSchema.safeParse({
      digit1: "",
      digit2: "2",
      digit3: "3",
      digit4: "4",
      digit5: "5",
      digit6: "6",
    });
    expect(result.success).toBe(false);
  });

  it("rejects multi-character string", () => {
    const result = signInOTPFormSchema.safeParse({
      digit1: "12",
      digit2: "2",
      digit3: "3",
      digit4: "4",
      digit5: "5",
      digit6: "6",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing digit field", () => {
    const result = signInOTPFormSchema.safeParse({
      digit1: "1",
      digit2: "2",
      digit3: "3",
      digit4: "4",
      digit5: "5",
    });
    expect(result.success).toBe(false);
  });
});
