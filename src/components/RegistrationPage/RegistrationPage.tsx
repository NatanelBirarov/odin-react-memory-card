import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useState } from "react";
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

export default function RegistrationPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>({ resolver: zodResolver(formSchema) });

  const { setIsLogged } = useOutletContext<ContextType>();
  const [errorList, setErrorList] = useState<string[]>([]);
  const navigate = useNavigate();

  async function onSubmit(data: IFormInput) {
    try {
      await ApiClient.register(data.email, data.password);
      setIsLogged(true);
      navigate("/usernamesetup");
    } catch (error) {
      // Handle registration error (e.g., show error messages)
      setErrorList(error.issues);
    }
  }

  return (
    <Modal contentType="modalContent">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Register</h2>
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
          Register
        </Button>
        <span>
          Already have an account?{" "}
          <a href="/login?redirectTo=titlescreen">Log in!</a>
        </span>
      </form>
    </Modal>
  );
}
