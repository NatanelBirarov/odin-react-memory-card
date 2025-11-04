import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import { ISignUpFormData } from "../../scripts/types";
import ApiClient from "../../scripts/apiClient";

import styles from "./SignUpPage.module.css";

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, "Username must be between 3 and 20 characters")
      .max(20, "Username must be between 3 and 20 characters"),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be between 6 and 12 characters")
      .max(12, "Password must be between 6 and 12 characters")
      .regex(
        // At least one uppercase letter, one lowercase letter, one number, and one special character
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
    image: z.url("Invalid image format").optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<ISignUpFormData>({ resolver: zodResolver(formSchema) });

  const [errorList, setErrorList] = useState<string[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const navigate = useNavigate();

  async function onSubmit(formData: ISignUpFormData) {
    try {
      const { data, error } = await ApiClient.signUp(formData, {
        onSuccess: () => {
          // On success
          navigate("/titlescreen");
        },
        onError: (error) => {
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
      // Handle sign up error (e.g., show error messages)
      setErrorList([error.message || "An unexpected error occurred"]);
    }
  }

  return (
    <Modal contentType="modalContent">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Sign Up</h2>
        {errorList.length > 0 && (
          <div>
            {errorList.map((error, index) => (
              <p key={index} style={{ color: "red" }}>
                {error}
              </p>
            ))}
          </div>
        )}
        <div>
          <label>Username:</label>
          <input
            type="text"
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            disabled={isPending}
          />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            disabled={isPending}
          />
          {errors.email && <span>{errors.email.message}</span>}
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            {...register("password")}
            disabled={isPending}
          />
          {errors.password && <span>{errors.password.message}</span>}
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            {...register("confirmPassword")}
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <span>{errors.confirmPassword.message}</span>
          )}
        </div>
        <div>
          <label>Image (optional):</label>
          <input type="file" {...register("image")} disabled={isPending} />
          {errors.image && <span>{errors.image.message}</span>}
        </div>
        <Button type="modal" submit disabled={isPending}>
          Sign Up
        </Button>
        <span>
          Already have an account?{" "}
          <a href="/signin?redirectTo=titlescreen">Log in!</a>
        </span>
      </form>
    </Modal>
  );
}
