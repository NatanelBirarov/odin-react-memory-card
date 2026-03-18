import z from "zod";

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const formSchema = z
  .object({
    username: z
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
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
    image: z
      .any()
      .refine(
        (files) => {
          if (files?.length === 0) return true;
          return files?.[0]?.size <= MAX_FILE_SIZE;
        },
        {
          message: "Max image size is 5MB.",
          path: ["image"],
        },
      )
      .refine(
        (files) => {
          if (files?.length === 0) return true;
          return ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type);
        },
        {
          message: "Only .jpg, .jpeg, .png and .webp formats are supported.",
          path: ["image"],
        },
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInFormSchema = z.object({
  email: z.email("Invalid email address"),
});

export const signInOTPFormSchema = z.object({
  digit1: z.string().regex(/^\d$/, "Please enter a valid 6-digit OTP"),
  digit2: z.string().regex(/^\d$/, "Please enter a valid 6-digit OTP"),
  digit3: z.string().regex(/^\d$/, "Please enter a valid 6-digit OTP"),
  digit4: z.string().regex(/^\d$/, "Please enter a valid 6-digit OTP"),
  digit5: z.string().regex(/^\d$/, "Please enter a valid 6-digit OTP"),
  digit6: z.string().regex(/^\d$/, "Please enter a valid 6-digit OTP"),
});

export type ISignUpFormData = z.infer<typeof formSchema>;
export type ISignInFormData = z.infer<typeof signInFormSchema>;
export type ISignInOTPFormData = z.infer<typeof signInOTPFormSchema>;
