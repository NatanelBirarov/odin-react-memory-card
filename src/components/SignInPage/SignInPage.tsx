import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import OTPInput, { OTPInputHandle } from "../OTPInput/OTPInput";
import {
  ISignInFormData,
  signInFormSchema,
} from "../../scripts/validationSchemas";
import { handleApiError } from "../../scripts/errorUtils";
import styles from "./SignInPage.module.css";

const RESEND_COOLDOWN_SECONDS = 30;

export default function SignInPage() {
  const {
    register: registerSignIn,
    formState: { errors },
    handleSubmit: handleSubmitSignIn,
  } = useForm<ISignInFormData>({ resolver: zodResolver(signInFormSchema) });

  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOTPSent, setIsOTPSent] = useState<boolean>(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const navigate = useNavigate();

  const otpInputRef = useRef<OTPInputHandle>(null);

  // Countdown timer for the resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (newOtp: string) => {
    setOtp(newOtp);
    if (errorList.length > 0) {
      setErrorList([]);
    }
  };

  async function onOTPSubmit(codeToVerify?: string) {
    // Strip space placeholders used by OTPInput for positional gaps
    const finalCode = (codeToVerify ?? otp).replace(/\s/g, "");

    if (finalCode.length < 6) {
      setErrorList(["Please enter the full 6-digit code"]);
      return;
    }

    if (isPending) return;

    setIsPending(true);
    try {
      const { error } = await ApiClient.verifyOTP({
        email,
        otp: finalCode,
      });

      if (error) {
        console.error("OTP verification error:", error);
        setErrorList(handleApiError(error, "Sign in failed"));
        // Focus the last input box on failure
        otpInputRef.current?.focusLast();
      } else {
        setErrorList([]);
        void navigate("/titlepage");
      }
    } catch (error: unknown) {
      console.error("OTP verification error:", error);
      setErrorList(handleApiError(error, "Sign in failed"));
      // Focus the last input box on failure
      otpInputRef.current?.focusLast();
    } finally {
      setIsPending(false);
    }
  }

  async function requestOTP(targetEmail: string) {
    if (isPending || !targetEmail) return;

    setIsPending(true);
    try {
      const { error } = await ApiClient.signInWithOTP({ email: targetEmail });
      if (error) {
        console.error("Sign in error:", error);
        setErrorList(handleApiError(error, "Failed to send code"));
      } else {
        setEmail(targetEmail);
        setOtp("");
        setIsOTPSent(true);
        setErrorList([]);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        otpInputRef.current?.clear();
      }
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      setErrorList(handleApiError(error, "Failed to send code"));
    } finally {
      setIsPending(false);
    }
  }

  async function onSignInSubmit(formData: ISignInFormData) {
    await requestOTP(formData.email);
  }

  async function handleResendOTP() {
    if (resendCooldown > 0) return;
    await requestOTP(email);
  }

  return (
    <Modal contentType="modalContent">
      {isOTPSent ? (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void onOTPSubmit();
          }}
        >
          <h2 className={styles.title}>Enter Verification Code</h2>

          <div className={styles.emailInfo}>
            <span className={styles.emailInfoLabel}>
              We sent a 6-digit code to:
            </span>
            <span className={styles.emailHighlight}>{email}</span>
            <button
              type="button"
              className={styles.changeEmailBtn}
              onClick={() => {
                setIsOTPSent(false);
                setOtp("");
                setErrorList([]);
                setResendCooldown(0);
              }}
              disabled={isPending}
            >
              Wrong email? Change it
            </button>
          </div>

          {errorList.length > 0 && (
            <div className={styles.errorList}>
              {errorList.map((error, index) => (
                <p key={index} className={styles.errorText}>
                  {error}
                </p>
              ))}
            </div>
          )}

          <div className={styles.inputGroup}>
            <OTPInput
              ref={otpInputRef}
              length={6}
              value={otp}
              onChange={handleOtpChange}
              onComplete={(completedOtp) => {
                void onOTPSubmit(completedOtp);
              }}
              hasError={errorList.length > 0}
              disabled={isPending}
              autoFocus
            />
          </div>

          <Button type="modal" submit disabled={isPending}>
            Verify OTP
          </Button>

          <div className={styles.resendSection}>
            {resendCooldown > 0 ? (
              <span className={styles.resendCooldown}>
                Resend code in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                className={styles.resendBtn}
                onClick={() => void handleResendOTP()}
                disabled={isPending}
              >
                Didn&apos;t receive a code? Resend
              </button>
            )}
          </div>
        </form>
      ) : (
        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => {
            void handleSubmitSignIn(onSignInSubmit)(e);
          }}
        >
          <h2 className={styles.title}>Sign In</h2>
          {errorList.length > 0 && (
            <div className={styles.errorList}>
              {errorList.map((error, index) => (
                <p key={index} className={styles.errorText}>
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
              disabled={isPending}
            />
            {errors.email && <span>{errors.email.message}</span>}
          </div>

          <Button type="modal" submit disabled={isPending}>
            {isPending ? "Sending Code..." : "Sign In"}
          </Button>
          <span className={styles.redirectText}>
            Don't have an account?{" "}
            <a href="/signup">Sign up</a>
          </span>
        </form>
      )}
    </Modal>
  );
}
