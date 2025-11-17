import { useForm, FieldError } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import ApiClient from "../../scripts/apiClient";

import styles from "./SignUpPage.module.css";
import { formSchema, ISignUpFormData } from "../../scripts/validationSchemas";

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
    console.log("Submitting form data:", formData);
    try {
      const { data, error } = await ApiClient.signUp(formData, {
        onSuccess: () => {
          // On success
          navigate("/titlepage");
        },
        onError: (error) => {
          // On error
          console.log("Sign up error:", error);
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
      console.log("Sign up error:", error);
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
            {...register("username")}
            aria-invalid={errors.username ? "true" : "false"}
            disabled={isPending}
          />
          {errors.username && <span>{errors.username.message}</span>}
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
          {errors.image && (
            <span>
              {"message" in errors.image
                ? (errors.image.message as string)
                : "image" in errors.image
                ? (errors.image.image?.message as string)
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
    </Modal>
  );
}
