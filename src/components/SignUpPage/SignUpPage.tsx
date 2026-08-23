import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ApiClient from "../../scripts/apiClient";
import { formSchema, ISignUpFormData } from "../../scripts/validationSchemas";

import styles from "./SignUpPage.module.css";
import { authClient } from "../../scripts/authClient";
import PasswordRequirements from "../PasswordRequirements/PasswordRequirements";

export default function SignUpPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ISignUpFormData>({ resolver: zodResolver(formSchema) });

  const [errorList, setErrorList] = useState<string[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [waitingForVerification, setWaitingForVerification] =
    useState<boolean>(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [passwordRequirements, setPasswordRequirements] = useState({
    hasCorrectLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (waitingForVerification) {
      pollIntervalRef.current = setInterval(() => {
        void (async () => {
          const userSession = await authClient.getSession();
          if (userSession.data?.user.emailVerified) {
            // Email verified! Clean up and navigate
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            setSuccessMessage("Email verified! Redirecting...");
            setTimeout(() => {
              void navigate("/titlepage");
            }, 1500);
          }
        })();
      }, 3000); // Check every 3 seconds

      // Cleanup on unmount
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [waitingForVerification, navigate]);

  async function onSubmit(formData: ISignUpFormData) {
    setIsPending(true);
    try {
      await ApiClient.signUp(formData);
      setSuccessMessage(
        "Please check your email to verify your account. Once verified, the page will automatically redirect.",
      );
      setWaitingForVerification(true);
      setErrorList([]);
    } catch (error: unknown) {
      // Handle sign up error (e.g., show error messages)
      console.log("Sign up error:", error);
      const errors = Array.isArray((error as { message: [string] }).message)
        ? (error as { message: [string] }).message
        : [(error as { message: string }).message || "Sign up failed"];
      setErrorList(errors);
      setWaitingForVerification(false);
    } finally {
      setIsPending(false);
    }
  }

  const validatePasswordRequirements = (password: string) => {
    setPasswordRequirements({
      hasCorrectLength: password.length >= 6 && password.length <= 12,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    });
  };

  return (
    <Modal contentType="modalContent">
      {successMessage ? (
        <div
          style={{
            padding: "16px",
            backgroundColor: waitingForVerification ? "#fff3cd" : "#d4edda",
            color: waitingForVerification ? "#856404" : "#155724",
            borderRadius: "4px",
            marginBottom: "16px",
            border: `1px solid ${
              waitingForVerification ? "#ffeaa7" : "#c3e6cb"
            }`,
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{successMessage}</p>
          {waitingForVerification && (
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  width: "100%",
                  height: "4px",
                  backgroundColor: "#ffeaa7",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "30%",
                    height: "100%",
                    backgroundColor: "#856404",
                    animation: "progress 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <form
          className={styles.form}
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          <h2 className={styles.title}>Sign Up</h2>
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
            <label>Username:</label>
            <input
              type="text"
              {...register("username")}
              aria-invalid={errors.username ? "true" : "false"}
              disabled={isPending}
            />
            {errors.username && (
              <span className={styles.errorMessage}>
                {errors.username.message}
              </span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              disabled={isPending}
            />
            {errors.email && (
              <span className={styles.errorMessage}>
                {errors.email.message}
              </span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>Password:</label>
            <input
              type="password"
              {...register("password")}
              disabled={isPending}
              onChange={(e) => validatePasswordRequirements(e.target.value)}
            />
            {errors.password && (
              <span className={styles.errorMessage}>
                {errors.password.message}
              </span>
            )}

            <PasswordRequirements requirements={passwordRequirements} />
          </div>
          <div className={styles.inputGroup}>
            <label>Confirm Password:</label>
            <input
              type="password"
              {...register("confirmPassword")}
              disabled={isPending}
            />
            {errors.confirmPassword && (
              <span className={styles.errorMessage}>
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
          <div className={styles.inputGroup}>
            <label>Image (optional):</label>
            <input type="file" {...register("image")} disabled={isPending} />
            {errors.image && (
              <span>
                {"message" in (errors.image as any)
                  ? ((errors.image as any).message as string)
                  : "image" in (errors.image as any)
                    ? ((errors.image as any).image?.message as string)
                    : "Invalid file"}
              </span>
            )}
          </div>
          <Button type="modal" submit disabled={isPending}>
            Sign Up
          </Button>
          <span>
            Already have an account?{" "}
            <a href="/signin?redirectTo=titlepage">Log in!</a>
          </span>
        </form>
      )}
    </Modal>
  );
}
