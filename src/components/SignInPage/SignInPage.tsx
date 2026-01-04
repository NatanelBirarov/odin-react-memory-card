import { useState } from "react";
import { useForm } from "react-hook-form";

import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import {
  ISignInCombinedFormData,
  ISignInFormData,
  ISignInOTPFormData,
  ISignInWithPasswordFormData,
} from "../../scripts/types";
import Button from "../Button/Button";
import { APIError } from "better-auth/*";

import styles from "./SignInPage.module.css";

export default function SignInPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ISignInCombinedFormData>();

  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOTPSent, setIsOTPSent] = useState<boolean>(false);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirectTo") || "/";

  async function onOTPSubmit(formData: ISignInOTPFormData) {}

  async function onSignInSubmit(formData: ISignInFormData) {
    try {
      const { data, error } = await ApiClient.signInWithOTP(formData, {
        onSuccess: () => {
          // On success
          // navigate("/titlepage");
          setIsOTPSent(true);
        },
        onError: (error: APIError) => {
          // On error
          const errors = Array.isArray(error.message)
            ? error.message
            : [error.message || "Sign up failed"];
          setErrorList(errors);
        },
        isPending: (pending) => {
          setIsPending(pending);
        },
      });
    } catch (error: any) {
      console.log("Sign up error:", error);
      setErrorList([error.message || "An unexpected error occurred"]);
    }
  }

  return (
    <Modal contentType="modalContent">
      {isOTPSent ? (
        <form className={styles.form} onSubmit={handleSubmit(onOTPSubmit)}>
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
              <input
                type="number"
                maxLength={1}
                {...register("digit1")}
                // value={otp}
                // onChange={(e) => setOtp(e.target.value)}
                disabled={isPending}
              />
              <input
                type="number"
                maxLength={1}
                {...register("digit2")}
                // value={otp}
                // onChange={(e) => setOtp(e.target.value)}
                disabled={isPending}
              />
              <input
                type="number"
                maxLength={1}
                {...register("digit3")}
                // value={otp}
                // onChange={(e) => setOtp(e.target.value)}
                disabled={isPending}
              />
              <input
                type="number"
                maxLength={1}
                {...register("digit4")}
                // value={otp}
                // onChange={(e) => setOtp(e.target.value)}
                disabled={isPending}
              />
              <input
                type="number"
                maxLength={1}
                {...register("digit5")}
                // value={otp}
                // onChange={(e) => setOtp(e.target.value)}
                disabled={isPending}
              />
              <input
                type="number"
                maxLength={1}
                {...register("digit6")}
                // value={otp}
                // onChange={(e) => setOtp(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <Button type="modal" submit disabled={isPending}>
            Verify OTP
          </Button>
        </form>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit(onSignInSubmit)}>
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
              {...register("email")}
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
