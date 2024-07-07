import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Greek from "../locales/gr/gr.json";
import English from "../locales/en/en.json";

const resources = {
  en: { translation: English },
  gr: { translation: Greek },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  supportedLngs: ["en", "gr"],
  fallbackLng: "en",
});

export default i18n;
