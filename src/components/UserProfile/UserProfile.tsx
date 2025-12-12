import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./UserProfile.module.css";
import { authClient } from "../../scripts/authClient";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

interface IUserProfileFormData {
  username: string;
  email: string;
}

interface IPasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

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
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordPending, setIsPasswordPending] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const userSession = authClient.useSession();

  // useEffect(() => {
  //   // Pre-fill form with current user data
  //   if (userSession.data?.user) {
  //     const user = userSession.data.user;
  //     // Set default values in the form
  //     register("username").onChange({
  //       target: { value: user.name || "" },
  //     } as any);
  //     register("email").onChange({
  //       target: { value: user.email || "" },
  //     } as any);
  //   }
  // }, [userSession.data, register]);

  const onSubmit = async (formData: IUserProfileFormData) => {
    setIsPending(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Update username
      if (formData.username.trim()) {
        await authClient.updateUser({
          name: formData.username.trim(),
        });
      }

      // Update email (if your API supports it)
      if (formData.email.trim()) {
        await authClient.changeEmail({
          newEmail: formData.email.trim(),
          callbackURL: "/signin", // to redirect after verification
        });
      }

      setSuccessMessage("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setErrorMessage(error.message || "Failed to update profile");
    } finally {
      setIsPending(false);
    }
  };

  const onPasswordSubmit = async (formData: IPasswordFormData) => {
    setIsPasswordPending(true);
    setPasswordErrorMessage("");
    setPasswordSuccessMessage("");

    try {
      // TODO: Call authClient.changePassword here
      // await authClient.changePassword({
      //   currentPassword: formData.oldPassword,
      //   newPassword: formData.newPassword,
      //   revokeOtherSessions: false,
      // });

      setPasswordSuccessMessage("Password updated successfully!");
      resetPasswordForm();
    } catch (error: any) {
      console.error("Error updating password:", error);
      setPasswordErrorMessage(error.message || "Failed to update password");
    } finally {
      setIsPasswordPending(false);
    }
  };

  return (
    <Modal contentType="modalContent">
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        <h2 className={styles.title}>User Profile</h2>

        {successMessage && <p className={styles.success}>{successMessage}</p>}
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Username:</label>
          <input
            type="text"
            defaultValue={userSession.data?.user?.name || ""}
            {...register("username", {
              required: "Username is required",
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
            defaultValue={userSession.data?.user?.email || ""}
            {...register("email", {
              required: "Email is required",
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
        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
      >
        <h3 className={styles.sectionTitle}></h3>

        {passwordSuccessMessage && (
          <p className={styles.success}>{passwordSuccessMessage}</p>
        )}
        {passwordErrorMessage && (
          <p className={styles.error}>{passwordErrorMessage}</p>
        )}

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
          {passwordErrors.oldPassword && (
            <span>{passwordErrors.oldPassword.message}</span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>New Password:</label>
          <input
            type="password"
            {...registerPassword("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be between 6 and 12 characters",
              },
              maxLength: {
                value: 12,
                message: "Password must be between 6 and 12 characters",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
            })}
            aria-invalid={passwordErrors.newPassword ? "true" : "false"}
            disabled={isPasswordPending}
          />
          {passwordErrors.newPassword && (
            <span>{passwordErrors.newPassword.message}</span>
          )}
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
          {passwordErrors.confirmPassword && (
            <span>{passwordErrors.confirmPassword.message}</span>
          )}
        </div>

        <Button type="modal" submit disabled={isPasswordPending}>
          {isPasswordPending ? "Saving..." : "Change Password"}
        </Button>
      </form>
    </Modal>
  );
}
