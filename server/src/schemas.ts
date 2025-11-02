import z from "zod";
import DatabaseService from "./databaseService";
import AuthService from "./authService";

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
