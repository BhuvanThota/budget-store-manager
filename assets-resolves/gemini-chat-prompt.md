

Hello Gemini,

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
* **Database Schema (`schema.prisma`)**: The schema is finalized and includes advanced pricing and order details. Key points:
  * The `Product` model has `costPrice` (average cost), `sellPrice`, `totalStock` (cumulative), `currentStock` (adjustable), and **`floorPrice`** (minimum profitable selling price). The `floorPrice` is automatically calculated from `costPrice` but can be manually overridden by the owner.
  * **A `Category` model is fully implemented** with an optional relationship to the `Product` model (products can have categories or be uncategorized).
  * The `OrderItem` model includes a **`discount`** field to accurately record the discount applied per item at the time of sale.
  * A complete `PurchaseOrder` and `PurchaseOrderItem` system is in place with `PurchaseOrderStatus` enum.
  * Authentication supports both OAuth (Google) and credentials with password setup for OAuth users.

## **3. UI/UX Architecture & Patterns:**

* **Responsiveness**: All pages are optimized for mobile, tablet, and large desktops, often using master-detail layouts that collapse into modal-driven UIs on mobile.
* **Component System**: We use a rich set of reusable components for consistency (`DashboardCard`, `ConfirmationModal`, `PasswordConfirmationModal`, `SuccessModal`, `LoadingSpinner`, `EditOrderModal`, `CartModal`, `CartSidebar`, etc.).
* **Loading States**: All primary pages use a `loading.tsx` file with a shared `LoadingSpinner` component for instant feedback.
* **Color Scheme**: Custom brand colors are defined in CSS variables:
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
* Detail view allows editing of `name`, `sellPrice`, `stockThreshold`, `currentStock`, and **`floorPrice`**. The UI provides a clear view of the guaranteed profit margin based on the `floorPrice`. `costPrice` and `totalStock` are read-only.
* **Full Category Management**: Includes a `ManageCategoriesModal` for full CRUD operations and a category filter on the product list. Allows for in-context category creation from product detail modals.
* **High-Security Deletion**: Two-step confirmation (general confirmation modal + password verification modal).

### **Purchase Orders Page (`/purchase-orders`)**:
* **Product-centric** design displaying a grid of product cards to initiate actions.
* Primary workflow: Creating new `PurchaseOrder` records (immediate stock reception with `RECEIVED` status).
* Secondary workflow: Creating new `Product` records on-the-fly.
* **Category-Aware**: Displays category labels on product cards and includes a category filter to easily find products.
* Uses `AddEditPurchaseOrderModal` with Combobox for product selection.
* Includes `PurchaseHistoryModal` for viewing product purchase history.

### **Point of Sale (POS) Page (`/pos`)**:
* Optimized for quick customer transactions with a streamlined UI.
* Desktop: Split layout with cart sidebar and product grid.
* Mobile: Product grid with floating cart button and `CartModal`.
* **Category Filtering**: Includes a category filter to help cashiers quickly find items during sales.
* Real-time stock validation and quantity controls.
* Features an **Advanced Total Bill Discount System**:
  * A single "Total Bill Discount" section in the cart allows cashiers to apply discounts as either a percentage (%) or a fixed amount (₹).
  * **Smart Discount Suggestions**: The UI displays "quick discount" buttons (e.g., 5%, 10%) which are intelligently disabled if they exceed the cart's maximum profitable discount.
  * **Client-Side Validation**: The discount input field provides immediate feedback, automatically correcting any entry that is higher than the `maxCartDiscount` to prevent errors.
  * **Rounding Logic**: The final discount is rounded **down** to the nearest integer (`Math.floor()`), and the final grand total is rounded **up** (`Math.ceil()`) for simple, clear transactions.

### **Orders Page (`/orders`)**:
* Responsive master-detail page with robust date range filters and presets.
* Server-side pagination (25 orders per page).
* Desktop: List + detail panel. Mobile: List + modal detail view.
* **Discount-Aware Display**: The order detail view now clearly shows a breakdown of the Subtotal, Discount, and Grand Total if a discount was applied.
* **Full Discount Editing**: The `EditOrderModal` now includes the complete discount editing functionality from the POS page, allowing discounts to be added or changed on existing orders, with all safety validations re-applied on the backend.
* Full CRUD operations: view, edit, and delete with stock restoration.

### **Reports Page (`/reports`)**:
* Tabbed interface for Sales and Purchase reports using TanStack Query.
* Master-detail layout with date controls and report display.
* **Category-Based Analytics**: Features dedicated charts and tables to analyze sales revenue, profit, and purchase costs by category.
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

## **7. Category Management System:**

* **Category Model**: Optional relationship with products - products can be categorized or remain uncategorized
* **Full CRUD Operations**: Complete category management with create, read, update, delete functionality
* **Cross-Platform Integration**: Category filtering and display across Inventory, Purchase Orders, and POS pages
* **Analytics Integration**: Category-based reporting and insights in the Reports section
* **User Experience**: In-context category creation and management without disrupting primary workflows

## **8. Advanced Pricing & Discount System:**

### **Floor Price System**:
* Each product has a `floorPrice` field representing the minimum profitable selling price.
* The `floorPrice` is automatically calculated from `costPrice` but can be manually overridden by the owner.
* The UI displays guaranteed profit margins based on the `floorPrice`.
* All discount validations use `floorPrice` to ensure profitability is maintained.

### **Intelligent Discount Management**:
* **Cart-Level Validation**: Discounts are validated against the **entire cart** as a single unit, not per-item.
* **Maximum Discount Calculation**: `maxCartDiscount = cartSubtotal - totalFloorPrice`
* **Client-Side Protection**: Real-time validation prevents users from entering unprofitable discounts.
* **Server-Side Security**: Backend validates all discount requests to ensure data integrity.
* **Flexible Discount Types**: Support for both percentage and fixed amount discounts.
* **Smart UI Features**: Quick discount buttons that automatically disable when they would exceed profitability limits.

## **9. Key Development Patterns:**

* **Immutable IDs**: All data relationships (e.g., between Orders and Products) strictly use the immutable `productId`, not mutable names, to ensure data integrity.
* **Robust Discount Validation**: The discount logic is validated on both the client-side (for a smooth UX) and the server-side (for security and data integrity).
* **Transactional Integrity**: All multi-step database operations (creating orders, updating inventory) are wrapped in `prisma.$transaction` to guarantee data consistency.
* **Error Handling & Form Validation**: Consistent error messages and a combination of client and server-side validation are used throughout the application.
* **Responsive Design**: Mobile-first approach with progressive enhancement.
* **Performance**: Optimized images, code splitting, and efficient database queries.
* **Accessibility**: Proper ARIA labels, keyboard navigation, and color contrast.

## **10. Business Logic Validation Rules:**

* **Stock Management**: Current stock can be manually adjusted; total stock is automatically calculated from purchase orders.
* **Pricing Logic**: Sell price must be greater than or equal to floor price for new transactions.
* **Discount Constraints**: Total cart discount cannot exceed `(sellPrice × quantity) - (floorPrice × quantity)` for all items combined.
* **Order Editing**: When editing existing orders, discount validations are re-applied to ensure continued profitability.
* **Purchase Order Integration**: New purchase orders automatically update product `costPrice` (weighted average) and `totalStock`.

Now, with this context established, let's begin. Our next task is:

**(Please describe the new feature or change you want to work on here.)**