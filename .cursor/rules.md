# Cursor AI Rules for Bumpity Road

## Development Workflow Rules

### Prisma Commands
1. **ALWAYS kill the dev server before running Prisma commands**
   - Check for running terminals first: `list_dir` on the terminals folder
   - Read the terminal file to get the PID
   - Run `taskkill /PID <pid> /T /F` before any Prisma command
   - Prisma commands that require this:
     - `npx prisma generate`
     - `npx prisma db push`
     - `npx prisma migrate`

2. **After schema changes:**
   - Stop dev server
   - Run `npx prisma generate`
   - User will restart dev server themselves

### Build Commands
1. **DO NOT run `npm run build` unless explicitly requested**
   - The dev server with Turbopack provides real-time error feedback
   - Let the user verify in their running dev server
   - Only run builds when the user specifically asks to verify production build

### Code Style
1. **Use plain HTML elements with Tailwind CSS**
   - Don't use shadcn/ui components (they may not exist)
   - Style with Tailwind classes directly on `<div>`, `<button>`, `<input>`, etc.

2. **Import patterns:**
   - Auth: `import { auth } from "@/utils/auth"`
   - Prisma: `import { prisma } from "@/utils/prisma"`
   - Auth client: `import { authClient } from "@/lib/auth-client"`

3. **Card components pattern:**
   ```tsx
   <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
     <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[color]-50 via-background to-[color]-50 dark:from-[color]-950/30 dark:via-background dark:to-[color]-950/20" />
     <div className="relative p-6">
       {/* Content */}
     </div>
   </div>
   ```

### Next.js 16 Specifics
1. **Cache invalidation:**
   - Use `revalidatePath()` instead of `revalidateTag()`
   - `revalidateTag` has changed signature in Next.js 16

2. **API Routes:**
   - Use `headers()` from `next/headers` for session checks
   - Pattern: `await auth.api.getSession({ headers: await headers(), asResponse: false })`

### File Organization
- Types: `src/types/`
- Hooks: `src/hooks/`
- Utils/Libs: `src/lib/` and `src/utils/`
- Components: `src/components/`
- API Routes: `src/app/api/`

### Terminal Commands on Windows
- Use `;` instead of `&&` for command chaining in PowerShell
- Example: `cd path; npm run dev` not `cd path && npm run dev`

