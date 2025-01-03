import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
      description: "Your API Description",
    },
    servers: [
      {
        url: "{protocol}://{server}:{port}",
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
  apis: [path.resolve(__dirname, "./path/*.yaml")],
};

const specs = swaggerJsdoc(options);

export default specs;
