# Tech Stack

## Framework & Runtime
- Next.js 15 with App Router
- React 19
- TypeScript 5 (strict mode)
- Bun as package manager

## UI & Styling
- Tailwind CSS 4 with CSS variables
- shadcn/ui (New York style) - components in `src/components/ui/`
- Radix UI primitives
- Framer Motion for animations
- React Icons for icons (replaced Lucide)
- Geist font family (sans + mono)

## Key Libraries
- `class-variance-authority` + `clsx` + `tailwind-merge` for className utilities
- `canvas-confetti` for celebration effects
- `zod` for validation
- `react-hook-form` for forms

## Development Tools
- ESLint 9
- Turbopack (via `next dev --turbopack`)
- orchids-visual-edits for visual editing integration

## Commands
```bash
bun dev          # Start dev server with Turbopack
bun run build    # Production build
bun run start    # Start production server
bun run lint     # Run ESLint
```

## Path Aliases
- `@/*` maps to `./src/*`
