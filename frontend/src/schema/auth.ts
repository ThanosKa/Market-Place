import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  password: Yup.string().required("Password is required"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("password")], "Passwords must match"),
});

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    // .matches(
    //   /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!$@%])[A-Za-z\d!$@%]{6,}$/,
    //   "Password must be at least 6 characters long, contain at least one letter, one number, and one special character"
    // )
    .required("New password is required"),
  confirmNewPassword: Yup.string()
    .test(
      "confirmPassword",
      "Passwords must match",
      (value, context) => value === context.parent.newPassword
    )
    .required("Confirm new password is required"),
});

export type ChangePasswordFormData = Yup.InferType<typeof changePasswordSchema>;
