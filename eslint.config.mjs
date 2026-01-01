// NOTE: Next.js 16.x removed the `next lint` CLI command.
// We run ESLint directly via `npm run lint`, but extending `eslint-config-next`
// currently triggers a circular structure error on Windows in this repo.
// Keep a minimal config so linting is usable; we can re-enable Next rules later.

export default [
  {
    ignores: ["node_modules/**", ".next/**", "src/generated/**"],
  },
];
