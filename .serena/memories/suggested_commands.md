# Essential Commands for Development

## Development Commands

```bash
npm run dev                 # Start development server (uses Vite)
npm run dev -- --open      # Start dev server and open in browser
npm run build               # Build for production
npm run preview             # Preview production build
```

## Code Quality Commands

```bash
npm run check               # Run Svelte type checking
npm run check:watch         # Run type checking in watch mode
npm run lint                # Run linting (Prettier + ESLint)
npm run format              # Format code with Prettier
```

## Database Commands

```bash
npm run db:push             # Push schema changes to database
npm run db:generate         # Generate migration files
npm run db:migrate          # Run database migrations
npm run db:studio           # Open Drizzle Studio for database management
```

## Project Setup

```bash
npm install                 # Install dependencies
npm run prepare             # Sync SvelteKit types
```

## System Commands (Darwin/macOS)

```bash
git                         # Version control (/opt/homebrew/bin/git)
ls -G                       # List files with colors (aliased)
grep --color=auto           # Search with colors (aliased, excludes .git)
find                        # File search (/usr/bin/find)
cd                          # Change directory
```

## Important Notes

- Development server runs on http://localhost:5173 (or next available port)
- Always run `npm run check` and `npm run lint` before committing
- Use `npm run format` to ensure consistent code formatting
- Database is SQLite stored in `local.db`
