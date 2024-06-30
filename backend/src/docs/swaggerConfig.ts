import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import fs from "fs";

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
        url: `http://localhost:${process.env.PORT || 5001}`,
        description: "Development server",
      },
    ],
  },
  apis: [
    path.resolve(__dirname, "../routes/*.ts"),
    path.resolve(__dirname, "../models/*.ts"),
    path.resolve(__dirname, "./path/*.yaml"),
  ],
};

const yamlFiles = fs
  .readdirSync(path.resolve(__dirname, "./path"))
  .filter((file) => file.endsWith(".yaml"));
// console.log("YAML files found:", yamlFiles);

const specs = swaggerJsdoc(options);

// Type assertion to avoid TypeScript error
const specPaths = (specs as any).paths;
// console.log(
//   "Swagger specs generated:",
//   specPaths ? Object.keys(specPaths) : "No paths found"
// );

export default specs;
