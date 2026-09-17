import dotenv from "dotenv";

dotenv.config();

type EnvConfig = {
  MONGO_URL: string;
  PORT: number;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
};

const getEnvVariable = (key: string, required = true): string => {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value as string;
};

export const env: EnvConfig = {
  MONGO_URL: getEnvVariable("MONGO_URL"),
  PORT: parseInt(getEnvVariable("PORT") || "3000", 10),
  ADMIN_EMAIL: getEnvVariable("ADMIN_EMAIL"),
  ADMIN_PASSWORD:getEnvVariable("ADMIN_PASSWORD"),
  JWT_SECRET:getEnvVariable("JWT_SECRET"),
};