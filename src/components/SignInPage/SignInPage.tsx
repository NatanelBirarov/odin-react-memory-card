import { useState } from "react";
import { useForm } from "react-hook-form";

import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import { useNavigate } from "react-router-dom";
import { ISignInFormData } from "../../scripts/types";
import Button from "../Button/Button";
import { APIError } from "better-auth/*";

import styles from "./SignInPage.module.css";

export default function SignInPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ISignInFormData>();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirectTo") || "/";

  async function onSubmit(formData: ISignInFormData) {
    try {
      const { data, error } = await ApiClient.signIn(formData, {
        onSuccess: () => {
          // On success
          navigate("/titlepage");
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
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
        <div className={styles.inputGroup}>
          <label>Password:</label>
          <input
            type="password"
            {...register("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
          />
          {errors.password && <span>{errors.password.message}</span>}
          <a href="/forgot-password" className={styles.forgotPassword}>
            Forgot password?
          </a>
        </div>
        <Button type="modal" submit disabled={isPending}>
          Sign In
        </Button>
        <span className={styles.redirectText}>
          Don't have an account?{" "}
          <a href={`/signup?redirectTo=${redirectTo}`}>Sign up</a>
        </span>
      </form>
    </Modal>
  );
}
