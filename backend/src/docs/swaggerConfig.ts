import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import fs from "fs";

const API_BASEPATH = process.env.API_BASEPATH || "api";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Version2 Application",
      version: "1.0.0",
      description: "API documentation for backend service",
    },
    servers: [
      {
        url: `{protocol}://{server}:{port}/${API_BASEPATH}`,
        variables: {
          protocol: {
            enum: ["http", "https"],
            default: process.env.PROTOCOL || "http",
          },
          server: {
            default: process.env.SERVER || "localhost",
          },
          port: {
            default: process.env.PORT || "5001",
          },
        },
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "./**/*.yaml"),
    path.resolve(__dirname, "./**/*.yml"),
  ],
};

console.log("Swagger configuration:");
console.log("API paths:", options.apis);
options.apis.forEach((pattern) => {
  console.log(`Searching for files matching: ${pattern}`);
  try {
    const files = fs
      .readdirSync(path.dirname(pattern))
      .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));
    console.log(`Found files: ${files.join(", ")}`);
  } catch (error) {
    console.error(`Error reading directory: ${error}`);
  }
});

console.log("Server URL:", options.definition.servers[0].url);

const specs = swaggerJsdoc(options);

export default specs;
