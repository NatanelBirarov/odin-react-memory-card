import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
import { ContextType } from "../../scripts/types";
import { authClient } from "../../scripts/authClient";

import styles from "./SignUpPage.module.css";

type IFormData = {
  name: string;
  email: string;
  password: string;
  image?: string;
};

const formSchema = z.object({
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
  image: z.url("Invalid image URL").optional(),
});

export default function SignUpPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormData>({ resolver: zodResolver(formSchema) });

  const { setUser, setIsLogged } = useOutletContext<ContextType>();
  const [errorList, setErrorList] = useState<string[]>([]);
  const navigate = useNavigate();

  async function onSubmit(formData: IFormData) {
    try {
      const { data, error } = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        image: formData.image || "",
        // callbackURL: `${
        //   import.meta.env.VITE_CLIENT_URL || "http://localhost:5173"
        // }/titlescreen`,
      });

      if (error) {
        // Better Auth returns structured errors
        const errors = Array.isArray(error.message)
          ? error.message
          : [error.message || "Sign up failed"];
        setErrorList(errors);
        return;
      }

      // Successful sign up
      setUser(data.user);
      setIsLogged(true);
      navigate("/titlescreen");
    } catch (error) {
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
          />
          {errors.name && <span>{errors.name.message}</span>}
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && <span>{errors.email.message}</span>}
        </div>
        <div>
          <label>Password:</label>
          <input type="password" {...register("password")} />
          {errors.password && <span>{errors.password.message}</span>}
        </div>
        <Button type="modal" submit>
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
