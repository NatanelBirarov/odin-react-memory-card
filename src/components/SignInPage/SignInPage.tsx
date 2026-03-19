import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import {
  ISignInFormData,
  ISignInOTPFormData,
} from "../../scripts/validationSchemas";
import Button from "../Button/Button";
import {
  signInFormSchema,
  signInOTPFormSchema,
} from "../../scripts/validationSchemas";

import styles from "./SignInPage.module.css";
// import { set } from "zod";

export default function SignInPage() {
  const {
    register: registerSignIn,
    formState: { errors },
    handleSubmit: handleSubmitSignIn,
  } = useForm<ISignInFormData>({ resolver: zodResolver(signInFormSchema) });

  const {
    register: registerOTP,
    formState: { errors: otpErrors },
    handleSubmit: handleSubmitOTP,
    setValue,
  } = useForm<ISignInOTPFormData>({
    resolver: zodResolver(signInOTPFormSchema),
  });

  const [email, setEmail] = useState<string>("");
  const [isOTPSent, setIsOTPSent] = useState<boolean>(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirectTo") || "/titlepage";
  const normalizedRedirect = redirectTo.startsWith("/")
    ? redirectTo
    : `/${redirectTo}`;

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOTPChange = (index: number, target: HTMLInputElement) => {
    // Only allow single digit
    if (target.value.length > target.maxLength) {
      target.value = target.value.slice(0, target.maxLength);
      return;
    }

    setValue(`digit${index + 1}` as keyof ISignInOTPFormData, target.value);

    // Move to next input if value is entered
    if (target.value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Move to previous input on backspace if current input is empty
    // setValue(`digit${index + 1}` as keyof ISignInOTPFormData, "");
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  async function onOTPSubmit(formData: ISignInOTPFormData) {
    setIsPending(true);
    try {
      const otpCode =
        (formData.digit1 || "") +
        (formData.digit2 || "") +
        (formData.digit3 || "") +
        (formData.digit4 || "") +
        (formData.digit5 || "") +
        (formData.digit6 || "");

      console.log("OTP code:", otpCode); // Debug log

      const { data, error } = await ApiClient.verifyOTP({
        email,
        otp: otpCode,
      });
      if (error) {
        console.log("OTP verification error:", error);
        const errors = Array.isArray(error.message)
          ? error.message
          : [error.message || "Sign in failed"];
        setErrorList(errors);
      } else {
        setErrorList([]);
        navigate(normalizedRedirect);
      }
    } catch (error: any) {
      console.log("OTP verification error:", error);
      const errors = Array.isArray(error.message)
        ? error.message
        : [error.message || "Sign in failed"];
      setErrorList(errors);
    } finally {
      setIsPending(false);
    }
  }

  async function onSignInSubmit(formData: ISignInFormData) {
    // setIsOTPSent(true);
    setIsPending(true);
    try {
      const { data, error } = await ApiClient.signInWithOTP(formData);
      if (error) {
        console.log("Sign in error:", error);
        const errors = Array.isArray(error.message)
          ? error.message
          : [error.message || "Sign in failed"];
        setErrorList(errors);
      } else {
        setIsOTPSent(true);
        setErrorList([]); // Clear any previous errors on success
      }
    } catch (error: any) {
      console.log("Sign in error:", error);
      const errors = Array.isArray(error.message)
        ? error.message
        : [error.message || "Sign in failed"];
      setErrorList(errors);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Modal contentType="modalContent">
      {isOTPSent ? (
        <form className={styles.form} onSubmit={handleSubmitOTP(onOTPSubmit)}>
          <h2 className={styles.title}>Enter OTP</h2>
          {errorList.length > 0 && (
            <div>
              {errorList.map((error, index) => (
                <p key={index} style={{ color: "red" }}>
                  {error}
                </p>
              ))}
            </div>
          )}
          <div className={styles.inputGroup}>
            <label>One-Time Password:</label>
            <div className={styles.otpInputs}>
              {[0, 1, 2, 3, 4, 5].map((_, index) => (
                <input
                  key={index}
                  type="number"
                  maxLength={1}
                  {...registerOTP(
                    `digit${index + 1}` as keyof ISignInOTPFormData,
                  )}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  onChange={(e) => handleOTPChange(index, e.target)}
                  onKeyDown={(e) => handleOTPKeyDown(index, e)}
                  disabled={isPending}
                />
              ))}
            </div>
            {(otpErrors.digit1 ||
              otpErrors.digit2 ||
              otpErrors.digit3 ||
              otpErrors.digit4 ||
              otpErrors.digit5 ||
              otpErrors.digit6) && (
              <span>
                {otpErrors.digit1?.message || "Please enter a valid OTP"}
              </span>
            )}
          </div>

          <Button type="modal" submit disabled={isPending}>
            Verify OTP
          </Button>
        </form>
      ) : (
        <form
          className={styles.form}
          onSubmit={handleSubmitSignIn(onSignInSubmit)}
        >
          <h2 className={styles.title}>Sign In</h2>
          {errorList.length > 0 && (
            <div>
              {errorList.map((error, index) => (
                <p key={index} style={{ color: "red" }}>
                  {error}
                </p>
              ))}
            </div>
          )}
          <div className={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              {...registerSignIn("email")}
              aria-invalid={errors.email ? "true" : "false"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
            />
            {errors.email && <span>{errors.email.message}</span>}
          </div>

          <Button type="modal" submit disabled={isPending}>
            Sign In
          </Button>
          <span className={styles.redirectText}>
            Don't have an account?{" "}
            <a href={`/signup?redirectTo=${redirectTo}`}>Sign up</a>
          </span>
        </form>
      )}
    </Modal>
  );
}
