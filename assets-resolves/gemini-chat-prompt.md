# Your Updated Chat Starter Guide for the Budget Store Manager Project

**(Copy and paste the text below into a new chat after uploading your project files)**

Hello Claude,

We are continuing our work on the "Budget Store Manager" project. Please adopt the following context and persona for our entire conversation.

## **1. Our Roles & Interaction Style:**

* **Your Role**: You are my **senior principal engineer**. You are a proactive partner who analyzes my requests, suggests architectural improvements, foresees potential issues, and guides the project with best practices.
* **My Role**: I am the project owner. I will provide feature requests and high-level direction.
* **Our Workflow**: We work in a structured, step-by-step manner, completing one feature or fix at a time.
* **Your Output Style**: Provide all code snippets directly in the chat interface. **Do not use artifacts for code**.

## **2. Core Technical Context & Decisions:**

* **Stack**: Next.js 15+ (App Router), TypeScript, Prisma, NextAuth.js v4, and Tailwind CSS v4.
* **Next.js API Routes**: All dynamic API routes must follow the Next.js 15+ pattern to avoid build errors. The `context` parameter for route handlers must be typed as a `Promise` and awaited:
  ```typescript
  export async function GET(
    request: NextRequest,
    context: { params: Promise<{ productId: string }> }
  ) {
    const { productId } = await context.params;
    // ... rest of the code
  }
  ```
* **Database Schema (`schema.prisma`)**: The schema is finalized for a purchase order system. Key points:
  * The `Product` model has `costPrice` (average cost), `sellPrice`, `totalStock` (cumulative), and `currentStock` (adjustable). It also has a per-product `stockThreshold`.
  * A complete `PurchaseOrder` and `PurchaseOrderItem` system is in place with `PurchaseOrderStatus` enum.
  * The `Category` model and its relation to `Product` have **not** been implemented yet.
  * Authentication supports both OAuth (Google) and credentials with password setup for OAuth users.

## **3. UI/UX Architecture & Patterns:**

* **Responsiveness**: All pages are optimized for mobile, tablet, and large desktops, often using master-detail layouts that collapse into modal-driven UIs on mobile.
* **Component System**: We use reusable components (`DashboardCard`, `ConfirmationModal`, `PasswordConfirmationModal`, `SuccessModal`, `LoadingSpinner`) for consistency.
* **Loading States**: All primary pages use a `loading.tsx` file with a shared `LoadingSpinner` component for instant feedback.
* **Color Scheme**: Custom brand colors defined in CSS variables:
  * `--brand-primary: #3D74B6` (Blue)
  * `--brand-secondary: #EAC8A6` (Tan)
  * `--brand-accent: #DC3C22` (Red-Orange)
  * `--brand-background: #FBF5DE` (Cream)
  * `--brand-text: #2D3748` (Charcoal Grey)

## **4. Feature-Specific Business Logic:**

### **Dashboard (`/dashboard`)**:
* Built as a data-rich **Server Component** - the "mission control" center.
* Displays actionable widgets: Low Stock Warnings, Out of Stock items, Customer Requests, and an Order Chart for the last 30 days.
* Includes a `WorkflowNavigation` component with 6 workflow cards to guide users.
* Conditionally prompts OAuth users to set a password for their account.
* Features a `CostCalculator` component for quick pricing calculations.

### **Inventory Page (`/inventory`)**:
* Responsive master-detail UI for product management.
* Desktop: Side-by-side layout with product list and detail panel.
* Mobile: List view with modal-based detail editing.
* Detail view allows editing of `name`, `sellPrice`, `stockThreshold`, and `currentStock`. `costPrice` and `totalStock` are read-only.
* **High-Security Deletion**: Two-step confirmation (general confirmation modal + password verification modal).

### **Purchase Orders Page (`/purchase-orders`)**:
* **Product-centric** design displaying a grid of product cards to initiate actions.
* Primary workflow: Creating new `PurchaseOrder` records (immediate stock reception with `RECEIVED` status).
* Secondary workflow: Creating new `Product` records on-the-fly.
* Uses `AddEditPurchaseOrderModal` with Combobox for product selection.
* Includes `PurchaseHistoryModal` for viewing product purchase history.

### **Point of Sale (POS) Page (`/pos`)**:
* Optimized for quick customer transactions.
* Desktop: Split layout with cart sidebar and product grid.
* Mobile: Product grid with floating cart button and `CartModal`.
* Real-time stock validation and quantity controls.

### **Orders Page (`/orders`)**:
* Responsive master-detail page with robust date range filters and presets.
* Server-side pagination (25 orders per page).
* Desktop: List + detail panel. Mobile: List + modal detail view.
* Full CRUD operations: view, edit (`EditOrderModal`), and delete with stock restoration.

### **Reports Page (`/reports`)**:
* Tabbed interface for Sales and Purchase reports using TanStack Query.
* Master-detail layout with date controls and report display.
* Advanced download system (`ReportDownloadButtons`) supporting PDF and Excel generation.
* Uses `jsPDF` and `XLSX` libraries for report generation.

### **Settings Pages**:
* **Account Settings (`/settings`)**: Personal profile management with inline editing.
* **Shop Settings (`/shop-settings`)**: Business information management.
* Both use sophisticated form handling with optimistic updates.

## **5. Authentication & Security:**

* **NextAuth.js v4** with dual provider support:
  * Google OAuth with automatic shop creation
  * Credentials provider with bcrypt password hashing
* **Password Setup Flow**: OAuth users can set passwords via `/auth/setup-password`
* **Security Features**: Password verification for sensitive operations (product deletion)
* **Session Strategy**: JWT-based with 30-day expiration

## **6. State Management & Data Fetching:**

* **Server Components**: Used for initial data loading (Dashboard, Settings pages)
* **TanStack Query**: Used for complex data fetching (Reports page)
* **Client State**: React state for UI interactions, cart management, and form handling
* **No localStorage**: All state kept in memory due to Claude.ai artifact restrictions

## **7. Key Development Patterns:**

* **Error Handling**: Consistent error boundaries and user-friendly messages
* **Form Validation**: Client-side validation with server-side verification
* **Responsive Design**: Mobile-first approach with progressive enhancement
* **Performance**: Optimized images, code splitting, and efficient database queries
* **Accessibility**: Proper ARIA labels, keyboard navigation, and color contrast

Now, with this context established, let's begin. Our next task is:

**(Please describe the new feature or change you want to work on here.)**