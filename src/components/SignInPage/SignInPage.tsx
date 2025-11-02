import { useState } from "react";
import { useForm } from "react-hook-form";

import ApiClient from "../../scripts/apiClient";
import Modal from "../Modal/Modal";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ContextType, IFormInput } from "../../scripts/types";
import Button from "../Button/Button";

export default function SignInPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IFormInput>();

  const { setIsLogged } = useOutletContext<ContextType>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorList, setErrorList] = useState<string[]>([]);
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const redirectTo = params.get("redirectTo") || "/";

  async function onSubmit(data: IFormInput) {
    try {
      await ApiClient.signIn(data.email, data.password);
      setIsLogged(true);
      navigate("/" + redirectTo);
    } catch (error) {
      setErrorList(error.issues);
    }
  }

  return (
    <Modal contentType="modalContent">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Sign In</h2>
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
        <Button type="modal" submit>
          Sign In
        </Button>
        <span>
          Don't have an account?{" "}
          <a href={`/signup?redirectTo=${redirectTo}`}>Sign up</a>
        </span>
      </form>
    </Modal>
  );
}
