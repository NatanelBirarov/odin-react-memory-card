import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { authClient } from "../../scripts/authClient";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import styles from "./ResetPasswordPage.module.css";

interface IResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<IResetPasswordFormData>();

  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Invalid or missing reset token");
      setHasToken(false);
    } else {
      setHasToken(true);
    }
  }, [token]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.close();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSuccess]);

  async function onSubmit(formData: IResetPasswordFormData) {
    if (!token) {
      setErrorMessage("Invalid reset token");
      return;
    }

    setIsPending(true);
    setErrorMessage("");

    try {
      await authClient.resetPassword({
        newPassword: formData.password,
        token: token,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      setErrorMessage((error as Error).message || "Failed to reset password");
    } finally {
      setIsPending(false);
    }
  }

  if (!hasToken) {
    return (
      <Modal contentType="modalContent">
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>✗</div>
          <h2 className={styles.title}>Invalid Reset Link</h2>
          <p className={styles.message}>
            The password reset link is invalid or has expired.
          </p>
          <p className={styles.submessage}>
            Please request a new password reset link.
          </p>
          <a href="/forgot-password" className={styles.backLink}>
            Request New Link
          </a>
        </div>
      </Modal>
    );
  }

  if (isSuccess) {
    return (
      <Modal contentType="modalContent">
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.title}>Password Reset Successful!</h2>
          <p className={styles.message}>
            Your password has been successfully reset.
          </p>
          <p className={styles.submessage}>
            This window will close in {countdown} second
            {countdown !== 1 ? "s" : ""}.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal contentType="modalContent">
      <form className={styles.form} onSubmit={void handleSubmit(onSubmit)}>
        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.description}>Enter your new password below.</p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.inputGroup}>
          <label>New Password:</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at between 6 and 12 characters",
              },
              maxLength: {
                value: 12,
                message: "Password must be at between 6 and 12 characters",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
            })}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
          />
          {errors.password && (
            <span className={styles.error}>{errors.password.message}</span>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label>Confirm Password:</label>
          <input
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <span className={styles.error}>
              {errors.confirmPassword.message}
            </span>
          )}
        </div>
        <Button type="modal" submit disabled={isPending}>
          {isPending ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Modal>
  );
}
