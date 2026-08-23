import { useEffect, useState } from "react";
import styles from "./EmailVerificationPage.module.css";
import { authClient } from "../../scripts/authClient";

export default function EmailVerificationPage() {
  const [countdown, setCountdown] = useState(10);
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  useEffect(() => {
    let cancelled = false;

    const verifyEmail = async () => {
      try {
        const userSession = await authClient.getSession();
        if (cancelled) return;

        if (userSession.data?.user.emailVerified) {
          setVerificationStatus("success");
        } else {
          setVerificationStatus("error");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Email verification check failed:", error);
          setVerificationStatus("error");
        }
      }
    };

    void verifyEmail();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (verificationStatus === "success") {
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
  }, [verificationStatus]);

  if (verificationStatus === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.message}>Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === "success") {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>Email Verified Successfully!</h1>
          <p className={styles.message}>
            Your email has been successfully verified. You can now close this
            window.
          </p>
          <p className={styles.countdown}>This window will automatically close in {countdown} seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorIcon}>✗</div>
        <h1 className={styles.title}>Verification Failed</h1>
        <p className={styles.message}>
          The verification link is invalid or has expired.
        </p>
        <p className={styles.submessage}>
          Please request a new verification email or contact support if the
          problem persists.
        </p>
      </div>
    </div>
  );
}
