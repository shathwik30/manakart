# CLAUDE.md

## ⚡ Quick Commands
- **Dev**: `npm run dev` (Port 3000)
- **DB Push**: `npm run db:push` (Sync schema)
- **DB Studio**: `npm run db:studio` (GUI)
- **Lint**: `npm run lint`

## 🛠 Tech Stack & Configuration
- **Frame**: Next.js 16.1.4 (App Router)
- **Language**: TypeScript (Strict)
- **Style**: Tailwind CSS 4 + `clsx` + `tailwind-merge`
- **DB**: Drizzle ORM (neon-http) + Neon Postgres
- **State**: Zustand (Store), React Context (Theme/Auth)
- **Auth**: Custom JWT (JOSE) + Bcrypt
- **Icons**: Lucide React
- **Forms**: Controlled inputs + Zod validation

## 📂 Project Structure
- **`src/app`**: Routes. `(admin)` for protected dashboard. Storefront pages are at the app root.
- **`src/lib`**:
  - `utils.ts`: Global helpers (formatting, validation).
  - `api.ts`: **Client-side** fetch wrapper (`api<T>(url, options)`).
  - `adminApi.ts`: Admin specific SDK.
  - `../db/index.ts`: Drizzle DB client. `../db/schema.ts`: All tables/enums.
  - `logger.ts`: Server-side logging.
- **`src/components`**:
  - `ui/`: Reusable primitives (buttons, modals).
  - `admin/`: Admin-specific forms/tables.

## 🧰 Core Utilities (`@/lib/utils.ts`)
**Always import from `@/lib/utils`**

### Responses (Server)
- `successResponse<T>(data: T, status?: number)`: Returns standard JSON success.
- `errorResponse(message: string, status?: number)`: Returns JSON error.

### Formatting
- `cn(...inputs)`: Merge tailwind classes. **Usage**: `className={cn("base", condition && "mod")}`.
- `formatPrice(paise)`: Returns "₹1,200". Input is in *paise*.
- `formatPriceShort(paise)`: Returns "1,200" (no symbol).
- `slugify(text)`: "Hello World" -> "hello-world".
- `formatDate(date)`: "15 January 2024".
- `getRelativeTime(date)`: "5m ago", "2h ago".

### Validation
- `isValidEmail(str)`: Boolean.
- `isValidPhone(str)`: Indian format (10 digit).
- `isValidPincode(str)`: Indian format (6 digit).

### Logic
- `generateOrderNumber()`: "ORD-YYYYMMDD-XXXX".
- `calculateDiscount(subtotal, type, value)`: Handles FLAT/PERCENTAGE.
- `calculateDiscountPercentage(original, discounted)`: Returns rounded %.
- `storage`: `{ get<T>, set<T>, remove }` (Safe LocalStorage).

## 🗄️ Database Context (`src/db/schema.ts` — Drizzle ORM)
**15 tables, 4 enums. Import: `import { db } from "@/db"`, `import { products, ... } from "@/db/schema"`**
- **Product**: `slug` (unique), `basePrice` (Int/paise), `images` (text[]), `stock`, `categoryId`, `brandId`.
- **Category**: hierarchical (`parentId` self-ref), `slug`, `showInNav`, `position`.
- **Brand**: `name`, `slug`, `logo`, `isActive`.
- **Cart**: Linked to `User` OR `sessionId` (guest). Contains `CartItem` (cartId+productId).
- **Order**: `orderNumber` (unique), `paymentStatus`, `orderStatus`, `addressSnapshot` (jsonb).
- **User**: `role` (USER/ADMIN). **Deal**, **Review**, **HeroContent**, **HomepageSection** also present.

## 📝 Coding Conventions

### Imports & Exports
- Use **Alias Imports**: `import { cn } from "@/lib/utils"` (Not `../../`).
- **Exports**: `export default function ComponentName` for components.
- **Types**: Define interfaces for Props. Use `interface` over `type` for object shapes.

### Component Patterns
1. **Interactivity**: Add `"use client";` ONLY if using hooks/events.
2. **Icons**: `<Search className="w-4 h-4" />` (Lucide).
3. **Images**: `<Image src={...} alt="..." fill className="object-cover" />` (Next.js optimized).
4. **Toast**: `import { toast } from "react-hot-toast"`. `toast.success("Saved")`.

### State Management
- **Fetching**: Use `useEffect` + `api/adminApi` for client data.
- **Loading**: Local `useState(false)` for loading states.

### Error Handling
- **Server**: `try/catch` -> Log -> `return errorResponse`.
- **Client**: `try/catch` -> `toast.error(err.message)`.

### Common Patterns
- **Prices**: Always store/transmit as **Integers (Paise)**. Divide by 100 for display using helpers.
- **Lists**: Use `map` with stable `key` (usually `id`).
- **Admin**: All admin routes must check `await requireAdmin()`.
