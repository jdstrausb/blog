# Suggested Commands

**Package Manager:** This project uses **Bun** as its package manager for faster installs and script execution.

## Development

### Start Development Server
```bash
bun run dev
# or with browser opening
bun run dev -- --open
```
Starts Vite dev server (default port: 5173)

### Type Checking
```bash
bun run check
# or with watch mode
bun run check:watch
```
Runs `svelte-check` to verify TypeScript types and Svelte components

## Building & Preview

### Production Build
```bash
bun run build
```
Creates optimized production build in `build/` directory

### Preview Production Build
```bash
bun run preview
```
Serves the production build locally for testing

## Code Quality

### Format Code
```bash
bun run format
```
Formats all files with Prettier (auto-fixes)

### Lint Code
```bash
bun run lint
```
Runs Prettier check and ESLint (does not auto-fix)

## Database (Drizzle)

### Push Schema Changes
```bash
bun run db:push
```
Push schema changes to database without migrations

### Generate Migrations
```bash
bun run db:generate
```
Generate migration files from schema changes

### Run Migrations
```bash
bun run db:migrate
```
Apply pending migrations to database

### Database Studio
```bash
bun run db:studio
```
Open Drizzle Studio for database inspection/editing

## Setup

### Initial Setup
```bash
bun install
```
Installs dependencies and runs SvelteKit sync

### Add Dependencies
```bash
bun add <package-name>
# or for dev dependencies
bun add -d <package-name>
```

### Remove Dependencies
```bash
bun remove <package-name>
```

### Update Dependencies
```bash
bun update
```

## System Utilities (Darwin/macOS)

Standard Unix commands work on macOS:
- `ls` - List directory contents
- `cd` - Change directory
- `git` - Git version control
- `grep` - Search file contents
- `find` - Find files
- `cat` - Display file contents
- `open` - Open files/directories in default application (macOS-specific)

## Git Workflow

### Check Status
```bash
git status
```

### Stage and Commit
```bash
git add .
git commit -m "message"
```

### Push to Remote
```bash
git push
```

## Testing Blog Posts

### Add New Blog Post
1. Create `.svx` file in `src/posts/YYYY/` directory
2. Add front matter with metadata (title, author, publishedAt, tags, etc.)
3. Write content in MDX format
4. Run `bun run dev` to preview

### Check Post Metadata
Posts should include:
- `title` - Post title
- `summary` - Brief description
- `author` - Author name
- `publishedAt` - ISO date string
- `tags` - Array of tag strings
- `featuredImage` - Optional image path
- `slug` - URL slug (auto-generated from filename)

## Port Configuration

Default ports:
- Dev server: 5173
- Preview: 4173
- Database studio: (Drizzle default)

To change port:
```bash
bun run dev -- --port 3000
```

## Bun-Specific Features

### Direct Script Execution
Bun can run scripts directly without `run`:
```bash
bun dev        # Same as bun run dev
bun build      # Same as bun run build
bun test       # Same as bun run test
```

### Performance Benefits
- **Faster installs**: Bun installs packages significantly faster than npm/yarn
- **Faster script execution**: Bun's JavaScript runtime is optimized for speed
- **Native TypeScript**: Bun runs TypeScript files directly without transpilation

### Lock File
- Uses `bun.lock` (binary format)
- Faster to read/write than JSON-based lock files
- Automatically updated with `bun install`

## Troubleshooting

### Clear Cache
```bash
bun pm cache rm
```

### Reinstall Dependencies
```bash
rm -rf node_modules bun.lock
bun install
```

### Check Bun Version
```bash
bun --version
```

### Update Bun
```bash
bun upgrade
```