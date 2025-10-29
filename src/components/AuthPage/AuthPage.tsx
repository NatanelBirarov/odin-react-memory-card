import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";

type IFormInput = {
  email: string;
  password: string;
};

const formSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be between 6 and 12 characters")
    .max(12, "Password must be between 6 and 12 characters"),
});

export default function AuthPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({ resolver: zodResolver(formSchema) });
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLogin) {
      await ApiClient.login(email, password);
    } else {
      await ApiClient.register(email, password);
    }
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
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
        <span>
          Don't have an account? <a>Sign up</a>
        </span>
      </form>
    </Modal>
  );
}
