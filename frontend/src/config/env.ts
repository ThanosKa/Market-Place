// env.ts or config/env.ts

interface EnvVars {
  PROTOCOL: string;
  SERVER: string;
  PORT: string;
  API_BASEPATH: string;
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
}

const env: EnvVars = {
  PROTOCOL: process.env.PROTOCOL || "http",
  SERVER: process.env.SERVER || "localhost",
  PORT: process.env.PORT || "5001",
  API_BASEPATH: process.env.API_BASEPATH || "api",
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Z2VudGxlLXJlaW5kZWVyLTQ3LmNsZXJrLmFjY291bnRzLmRldiQ",
};

export default env;
