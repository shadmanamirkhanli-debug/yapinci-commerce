import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-poçt tələb olunur")
    .email("Düzgün e-poçt daxil edin"),
  password: z
    .string()
    .min(1, "Şifrə tələb olunur")
    .min(8, "Şifrə ən azı 8 simvol olmalıdır"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Ad tələb olunur")
      .min(2, "Ad ən azı 2 simvol olmalıdır"),
    email: z
      .string()
      .min(1, "E-poçt tələb olunur")
      .email("Düzgün e-poçt daxil edin"),
    password: z
      .string()
      .min(8, "Şifrə ən azı 8 simvol olmalıdır")
      .regex(/[A-Z]/, "Şifrədə ən azı bir böyük hərf olmalıdır")
      .regex(/[0-9]/, "Şifrədə ən azı bir rəqəm olmalıdır"),
    confirmPassword: z.string().min(1, "Şifrəni təsdiqləyin"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-poçt tələb olunur")
    .email("Düzgün e-poçt daxil edin"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token tələb olunur"),
    password: z
      .string()
      .min(8, "Şifrə ən azı 8 simvol olmalıdır")
      .regex(/[A-Z]/, "Şifrədə ən azı bir böyük hərf olmalıdır")
      .regex(/[0-9]/, "Şifrədə ən azı bir rəqəm olmalıdır"),
    confirmPassword: z.string().min(1, "Şifrəni təsdiqləyin"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifrələr uyğun gəlmir",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
