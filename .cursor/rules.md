# Cursor AI Rules for Bumpity Road

## Development Workflow Rules

### Prisma Commands
1. **ALWAYS kill the dev server before running Prisma commands**
   - Check for running terminals first
   - Run `taskkill /PID <pid> /T /F` before any Prisma command
   - Applies to: `npx prisma generate`, `npx prisma db push`, `npx prisma migrate`

2. **After schema changes:**
   - Stop dev server
   - Run `npx prisma generate`
   - User will restart dev server themselves

### Build Commands
1. **DO NOT run `npm run build` unless explicitly requested**
   - The dev server with Turbopack provides real-time error feedback
   - Only run builds when the user specifically asks

### Code Style
1. **Use plain HTML elements with Tailwind CSS** — no shadcn/ui
2. **Import patterns:**
   - Auth: `import { auth } from "@/utils/auth"`
   - Prisma: `import { prisma } from "@/utils/prisma"`
   - Auth client: `import { authClient } from "@/lib/auth-client"`
   - Gradients: `import { CARD_GRADIENTS } from "@/lib/ui-gradients"`
   - Class merging: `import { cn } from "@/lib/utils"`

3. **Card components pattern:**
   ```tsx
   <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
     <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.emerald}`} />
     <div className="relative p-6">{/* Content */}</div>
   </div>
   ```

### Next.js 16 Specifics
1. **Cache invalidation:** Use `revalidatePath()` instead of `revalidateTag()`
2. **API Routes:** `await auth.api.getSession({ headers: await headers(), asResponse: false })`

### Tailwind v4
- Use `bg-linear-to-br` not `bg-gradient-to-br`
- Use `aspect-4/3` not `aspect-[4/3]`

### File Organization
- Types: `src/types/`
- Hooks: `src/hooks/`
- Utils/Libs: `src/lib/` and `src/utils/`
- Components: `src/components/` (feature-grouped with barrel `index.ts`)
- API Routes: `src/app/api/`

### Terminal Commands on Windows
- Use `;` instead of `&&` for command chaining in PowerShell
