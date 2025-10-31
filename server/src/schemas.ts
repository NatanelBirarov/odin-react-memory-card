import z from "zod";
import DatabaseService from "./databaseService";
import AuthService from "./authService";

export const registerFormSchema = z.object({
  email: z.email().refine(
    async (email) => {
      const existingUser = await DatabaseService.getUserByEmail(email);
      return !existingUser;
    },
    { message: "Email already in use" }
  ),
  password: z.string().min(6).max(12),
});

export const registerUsernameSchema = z.object({
  username: z.string().min(3).max(20),
});

export const loginFormSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
// .superRefine(async (data, ctx) => {
//   const { email, password } = data;
//   let user = await DatabaseService.getUserByEmail(email);

//   if (!user) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Email or password is incorrect",
//       path: ["email"],
//     });
//     return;
//   }

//   const isValid = await AuthService.comparePassword(
//     password,
//     user.passwordHash
//   );
//   if (!isValid) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Email or password is incorrect",
//       path: ["password"],
//     });
//   }
// });
