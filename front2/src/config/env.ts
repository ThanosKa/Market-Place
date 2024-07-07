// env.ts or config/env.ts

interface EnvVars {
  PROTOCOL: string;
  SERVER: string;
  PORT: string;
  API_BASEPATH: string;
}

const env: EnvVars = {
  PROTOCOL: process.env.PROTOCOL || "http",
  SERVER: process.env.SERVER || "localhost",
  PORT: process.env.PORT || "5001",
  API_BASEPATH: process.env.API_BASEPATH || "api",
};

export default env;
