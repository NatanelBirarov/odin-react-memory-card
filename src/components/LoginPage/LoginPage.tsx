import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import { useOutletContext } from "react-router-dom";
import { ContextType } from "../../scripts/types";

type IFormInput = {
  email: string;
  password: string;
};

const formSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be between 6 and 12 characters")
    .max(12, "Password must be between 6 and 12 characters")
    .refine(
      // At least one uppercase letter, one lowercase letter, one number, and one special character
      (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/.test(
          password
        ),
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
});

export default function AuthPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({ resolver: zodResolver(formSchema) });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await ApiClient.login(email, password);
  }

  return (
    <Modal contentType="modalContent">
      <form onSubmit={onSubmit}>
        <h2>Register</h2>
        <div>
          <label>Email:</label>
          <input
            type="email"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span>{errors.email.message}</span>}
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            {...register("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <span>{errors.password.message}</span>}
        </div>
        <span>
          Don't have an account? <a href="/register">Sign up</a>
        </span>
      </form>
    </Modal>
  );
}
