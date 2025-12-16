# Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx            # Main lucky draw page (client component)
│   ├── globals.css         # Global styles and Tailwind
│   └── favicon.ico
├── components/
│   ├── ui/                 # shadcn/ui components (do not edit directly)
│   ├── slot-machine.tsx    # Animated slot machine display
│   ├── result-overlay.tsx  # Winner announcement overlay
│   └── admin-panel.tsx     # Settings/import/export panel
├── hooks/
│   ├── use-lucky-draw.ts   # Core draw logic and state
│   ├── use-audio.ts        # Audio playback management
│   └── use-mobile.ts       # Mobile detection
└── lib/
    ├── types.ts            # TypeScript interfaces (Participant, Winner, etc.)
    ├── utils.ts            # cn() utility for classNames
    └── mock-data.ts        # Sample participant data
```

## Conventions
- Client components use `"use client"` directive
- Custom hooks prefixed with `use-`
- UI components from shadcn live in `components/ui/` - add new ones via CLI
- Feature components at `components/` root level
- Types centralized in `lib/types.ts`
- Use `@/` path alias for imports
