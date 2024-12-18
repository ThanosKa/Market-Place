import * as Yup from "yup";
import { TFunction } from "i18next"; // Make sure to import this

export const createForgotPasswordSchema = (t: TFunction) =>
  Yup.object().shape({
    email: Yup.string()
      .email(t("auth.invalidEmail"))
      .required(t("auth.emailRequired")),
  });

export const createLoginSchema = (t: TFunction) =>
  Yup.object().shape({
    login: Yup.string().required(t("auth.loginRequired")),
    password: Yup.string().required(t("auth.passwordRequired")),
  });

export const createRegisterSchema = (t: TFunction) =>
  Yup.object().shape({
    email: Yup.string()
      .email(t("auth.invalidEmail"))
      .required(t("auth.emailRequired")),
    username: Yup.string()
      .required(t("auth.usernameRequired"))
      .min(3, t("auth.usernameTooShort"))
      .max(20, t("auth.usernameTooLong"))
      .matches(/^[a-zA-Z0-9_]+$/, t("auth.usernameInvalidCharacters")),
    firstName: Yup.string().required(t("auth.firstNameRequired")),
    lastName: Yup.string().required(t("auth.lastNameRequired")),
    password: Yup.string().required(t("auth.passwordRequired")),
    confirmPassword: Yup.string()
      .required(t("auth.confirmPasswordRequired"))
      .oneOf([Yup.ref("password")], t("auth.passwordsMustMatch")),
  });

export const createChangePasswordSchema = (t: TFunction) =>
  Yup.object().shape({
    currentPassword: Yup.string().required(t("auth.currentPasswordRequired")),
    newPassword: Yup.string().required(t("auth.newPasswordRequired")),
    confirmNewPassword: Yup.string()
      .test(
        "confirmPassword",
        t("auth.passwordsMustMatch"),
        (value, context) => value === context.parent.newPassword
      )
      .required(t("auth.confirmNewPasswordRequired")),
  });

export type ChangePasswordFormData = Yup.InferType<
  ReturnType<typeof createChangePasswordSchema>
>;
