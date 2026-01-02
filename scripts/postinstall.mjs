import { spawn } from "node:child_process";

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: true });
    child.on("exit", (code) => resolve(code ?? 1));
  });
}

const code = await run("prisma", ["generate"]);

if (code === 0) {
  process.exit(0);
}

// Common on Windows when the Prisma query engine DLL is locked by another process/AV.
console.warn(
  "\n[postinstall] prisma generate failed. Continuing install anyway.\n" +
    "If you need Prisma Client, re-run `npx prisma generate` after closing other Node processes " +
    "or excluding node_modules from antivirus scans.\n"
);
process.exit(0);


