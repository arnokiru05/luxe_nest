# Luxe Nest - Developer Handoff Tasks

The following is a refined list of modifications and tasks required for the next phase of development. **Note: The application is removing customer authentication but retaining a robust cart and checkout flow.**

### 1. Navigation Bar Redesign
- Implement a comprehensive **3-tier navigation structure** to better organize content.
- Ensure dynamic **category links** are seamlessly integrated into the dropdowns/tiers to improve user discovery and site navigation.
- **Remove** any links related to user login, signup, or user profiles.

### 2. Hero Section Overhaul
- Redesign the homepage **hero section** to be highly appealing, modern, and engaging.
- Focus on strong imagery, clear calls-to-action (CTAs), and responsive design that makes a great first impression.

### 3. Product Cards & Dual Actions
- **Reduce cognitive load** on product cards by streamlining the displayed information (high-quality image, clear title, and price).
- **Dual Call-to-Actions:** Product cards should support both **"Add to Cart"** (to allow users to build a larger order) and **"Order via WhatsApp"** (for quick, single-item inquiries).

### 4. Checkout Form & Order Persistence
- **Guest Checkout Form:** When users proceed to checkout via the cart, present a form to collect essential details: **Name, Address, Phone, and Email**.
- **Database Persistence:** Upon successful submission of the checkout form, the order details must be securely persisted to the database.
- **WhatsApp Integration:** After the order is saved to the DB, route the customer to WhatsApp with a pre-filled message summarizing their complete order and details.

### 5. Category & Product Synchronization
- Ensure strict **synchronization between categories and products**.
- Verify that products map accurately to their respective categories, category counts are accurate, and edge cases are handled gracefully in the UI.

### 6. Shop Sidebar Enhancements
- Upgrade the shop sidebar by adding robust **filtering capabilities** (e.g., price ranges, availability, sub-categories).
- Ensure visual and functional **consistency** across all filter combinations and responsive states.

### 7. Admin & Catalog Verification
- Thoroughly test and verify **all CRUD operations** for the **admin dashboard** (managing products, categories, and incoming orders, order statuses change and persistence, download invoices for admin for ease of sending to customer).
- Mobile first approach

### 8. Authentication Flow Overhaul
- **Remove User Auth:** Completely remove customer signup and login functionality.
- **Remove Admin Signup:** Remove the admin registration page and the "admin code" logic.
- **Admin Login Only:** The only authentication page should be a secure **Admin Login**. 
- Remove the global header and footer from the Admin Login page to create a focused, distraction-free flow, but ensure a clear **"Back to Home"** link is prominently available. Apply similar layout adjustments to the admin dashboard.
