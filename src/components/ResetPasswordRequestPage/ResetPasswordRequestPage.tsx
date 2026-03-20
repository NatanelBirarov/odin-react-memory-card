import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "../../scripts/authClient";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import styles from "./ResetPasswordRequestPage.module.css";

interface IResetPasswordFormData {
  email: string;
}

export default function ResetPasswordRequestPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IResetPasswordFormData>();

  const [email, setEmail] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function onSubmit(formData: IResetPasswordFormData) {
    setIsPending(true);
    setErrorMessage("");

    try {
      const baseUrl =
        import.meta.env.VITE_ENV === "production"
          ? (import.meta.env.VITE_CLIENT_URL as string)
          : (import.meta.env.VITE_CLIENT_URL_DEV as string);

      await authClient.requestPasswordReset({
        email: formData.email,
        redirectTo: `${baseUrl}reset-password`, // URL to redirect to after password reset
      });
      setIsEmailSent(true);
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      setErrorMessage((error as Error).message || "Failed to send reset email");
    } finally {
      setIsPending(false);
    }
  }

  if (isEmailSent) {
    return (
      <Modal contentType="modalContent">
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.title}>Check Your Email</h2>
          <p className={styles.message}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className={styles.submessage}>
            Please check your inbox and follow the instructions to reset your
            password.
          </p>
          <a href="/signin" className={styles.backLink}>
            Back to Sign In
          </a>
        </div>
      </Modal>
    );
  }

  return (
    <Modal contentType="modalContent">
      <form className={styles.form} onSubmit={void handleSubmit(onSubmit)}>
        <h2 className={styles.title}>Reset Password</h2>
        <p className={styles.description}>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <div className={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            aria-invalid={errors.email ? "true" : "false"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
          />
          {errors.email && (
            <span className={styles.error}>{errors.email.message}</span>
          )}
        </div>
        <Button type="modal" submit disabled={isPending}>
          {isPending ? "Sending..." : "Send Reset Link"}
        </Button>
        <a href="/signin" className={styles.backLink}>
          Back to Sign In
        </a>
      </form>
    </Modal>
  );
}
