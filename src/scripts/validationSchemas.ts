import z from "zod";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;

const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function getFirstFile(files: unknown): File | undefined {
  if (!files) return undefined;
  if (files instanceof FileList) {
    return files.item(0) ?? undefined;
  }
  if (Array.isArray(files) && files[0] instanceof File) {
    return files[0];
  }
  return undefined;
}

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
        PASSWORD_REGEX,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
    image: z
      .unknown()
      .refine(
        (files: unknown) => {
          const firstFile = getFirstFile(files);
          if (!firstFile) return true;
          return firstFile.size <= MAX_FILE_SIZE;
        },
        {
          message: "Max image size is 5MB.",
          path: ["image"],
        },
      )
      .refine(
        (files: unknown) => {
          const firstFile = getFirstFile(files);
          if (!firstFile) return true;
          return ACCEPTED_IMAGE_MIME_TYPES.includes(firstFile.type);
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
