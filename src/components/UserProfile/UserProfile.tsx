import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./UserProfile.module.css";
import { authClient } from "../../scripts/authClient";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useNavigate } from "react-router";
import { PASSWORD_REGEX } from "../../scripts/validationSchemas";
import PasswordRequirements from "../PasswordRequirements/PasswordRequirements";
import { handleApiError } from "../../scripts/errorUtils";

interface IUserProfileFormData {
  username: string;
  email: string;
}

interface IPasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type StatusMessage = {
  type: "success" | "error";
  text: string;
} | null;

export default function UserProfile() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IUserProfileFormData>();

  const {
    register: registerPassword,
    formState: { errors: passwordErrors },
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
  } = useForm<IPasswordFormData>();

  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<StatusMessage>(null);
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<StatusMessage>(null);
  const userSession = authClient.useSession();
  const navigate = useNavigate();

  const [passwordRequirements, setPasswordRequirements] = useState({
    hasCorrectLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const currentData = useRef<IUserProfileFormData>({
    username: userSession.data?.user.name || "",
    email: userSession.data?.user.email || "",
  });

  useEffect(() => {
    // Update currentData ref when userSession changes
    currentData.current = {
      username: userSession.data?.user.name || "",
      email: userSession.data?.user.email || "",
    };
  }, [userSession.data]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (passwordMessage) {
      const timer = setTimeout(() => {
        setPasswordMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  const onSubmit = async (formData: IUserProfileFormData) => {
    setIsPending(true);
    setMessage(null);

    try {
      // Update username
      const trimmedUsername = formData.username.trim();
      if (trimmedUsername && trimmedUsername !== currentData.current.username) {
        await authClient.updateUser({
          name: trimmedUsername,
        });
        currentData.current.username = trimmedUsername;
        setMessage({ type: "success", text: "Username updated successfully!" });
      }

      // Update email (if your API supports it)
      const trimmedEmail = formData.email.trim();
      if (trimmedEmail && trimmedEmail !== currentData.current.email) {
        await authClient.changeEmail({
          newEmail: trimmedEmail,
          callbackURL: `${import.meta.env.VITE_ENV === "production"
            ? import.meta.env.VITE_CLIENT_URL_PROD
            : import.meta.env.VITE_CLIENT_URL_DEV
            }verify`, // to redirect after verification
        });
        currentData.current.email = trimmedEmail;
        setMessage({
          type: "success",
          text: "Email has been changed! Please verify your new email.",
        });
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errors = handleApiError(error, "Failed to update profile");
      setMessage({ type: "error", text: errors[0] });
    } finally {
      setIsPending(false);
    }
  };

  const onPasswordSubmit = async (formData: IPasswordFormData) => {
    setIsPasswordPending(true);
    setPasswordMessage(null);

    try {
      const { error } = await authClient.changePassword({
        newPassword: formData.newPassword,
        currentPassword: formData.oldPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        console.error(error);
        const errors = handleApiError(error, "Failed to update password");
        setPasswordMessage({ type: "error", text: errors[0] });
      } else {
        setPasswordMessage({
          type: "success",
          text: "Password updated successfully!",
        });
        resetPasswordForm();
        console.log("Password updated and other sessions logged out.");
        await authClient.signOut();
        setTimeout(() => {
          void navigate("/signin?redirectTo=titlepage");
        }, 3000);
      }
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      const errors = handleApiError(error, "Failed to update password");
      setPasswordMessage({ type: "error", text: errors[0] });
    } finally {
      setIsPasswordPending(false);
    }
  };

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
    <>
      {message && (
        <div className={styles.notification}>
          <p
            className={
              message.type === "error" ? styles.error : styles.success
            }
          >
            {message.text}
          </p>
        </div>
      )}

      {passwordMessage && (
        <div className={styles.notification}>
          <p
            className={
              passwordMessage.type === "error" ? styles.error : styles.success
            }
          >
            {passwordMessage.text}
          </p>
        </div>
      )}

      <Modal contentType="modalContent">
        <form className={styles.form} onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <h2 className={styles.title}>User Profile</h2>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Username:</label>
            <input
              type="text"
              defaultValue={userSession.data?.user.name || ""}
              {...register("username", {
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
                maxLength: {
                  value: 20,
                  message: "Username must be less than 20 characters",
                },
              })}
              aria-invalid={errors.username ? "true" : "false"}
              disabled={isPending}
            />
            {errors.username && <span>{errors.username.message}</span>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Email:</label>
            <input
              type="email"
              defaultValue={userSession.data?.user.email || ""}
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              aria-invalid={errors.email ? "true" : "false"}
              disabled={isPending}
            />
            {errors.email && <span>{errors.email.message}</span>}
          </div>

          <Button type="modal" submit disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>

        <form
          className={styles.form}
          onSubmit={(e) => void handlePasswordSubmit(onPasswordSubmit)(e)}
        >
          <h3 className={styles.sectionTitle}>Change Password</h3>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Current Password:</label>
            <input
              type="password"
              {...registerPassword("oldPassword", {
                required: "Current password is required",
              })}
              aria-invalid={passwordErrors.oldPassword ? "true" : "false"}
              disabled={isPasswordPending}
            />
            <span>{passwordErrors.oldPassword?.message}</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>New Password:</label>
            <input
              type="password"
              {...registerPassword("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password is not valid",
                },
                maxLength: {
                  value: 12,
                  message: "Password is not valid",
                },
                pattern: {
                  value: PASSWORD_REGEX,
                  message: "Password is not valid",
                },
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  validatePasswordRequirements(e.target.value),
              })}
              aria-invalid={passwordErrors.newPassword ? "true" : "false"}
              disabled={isPasswordPending}
            />

            <PasswordRequirements requirements={passwordRequirements} />

            <span>{passwordErrors.newPassword?.message}</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Confirm New Password:</label>
            <input
              type="password"
              {...registerPassword("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === watch("newPassword") || "Passwords do not match",
              })}
              aria-invalid={passwordErrors.confirmPassword ? "true" : "false"}
              disabled={isPasswordPending}
            />
            <span>{passwordErrors.confirmPassword?.message}</span>
          </div>

          <Button type="modal" submit disabled={isPasswordPending}>
            {isPasswordPending ? "Saving..." : "Change Password"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
