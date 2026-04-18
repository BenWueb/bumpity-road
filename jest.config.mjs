import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import("jest").Config} */
const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "src/utils/badges.ts",
    "src/app/api/**/route.ts",
    "src/components/todos/**/*.{ts,tsx}",
    "src/hooks/use-todos.ts",
    "!**/*.d.ts",
    "!**/*.test.{ts,tsx}",
  ],
};

export default createJestConfig(customJestConfig);


