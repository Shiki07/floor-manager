

# Landing Page for Floor Manager

## Overview
Create a public-facing landing page at `/landing` that showcases Floor Manager's features and drives signups. The current `/` route stays protected for the dashboard; the landing page will be a new route visitors see before signing up.

## Structure

### New Files
- **`src/pages/Landing.tsx`** -- The full landing page component

### Modified Files
- **`src/App.tsx`** -- Add `/landing` route and redirect unauthenticated root visitors

## Landing Page Sections

1. **Hero Section**
   - ChefHat logo with orange gradient glow
   - Headline: "Your Restaurant, Fully Under Control"
   - Subtitle describing the all-in-one management platform
   - Two CTAs: "Get Started Free" and "See How It Works" (scrolls down)
   - Subtle animated gradient background

2. **Features Grid** (6 cards with icons)
   - Real-Time Orders (LayoutDashboard)
   - Staff Management (Users)
   - Menu Builder (UtensilsCrossed)
   - Reservations (CalendarDays)
   - Inventory Tracking (Package)
   - Financial Reports (DollarSign)
   - Each card has an icon, title, and short description with hover effects

3. **How It Works** (3 steps)
   - Sign Up -- Create your account in seconds
   - Set Up Your Restaurant -- Add menu, staff, and tables
   - Start Managing -- Everything from one dashboard

4. **Social Proof / Stats Bar**
   - Key metrics like "Real-time updates", "7 modules", "Mobile ready"

5. **Final CTA Section**
   - "Ready to streamline your restaurant?" with a sign-up button

6. **Footer**
   - Minimal footer with branding

## Routing Changes
- Add `/landing` as a public route
- Unauthenticated users visiting `/` will be sent to `/landing` instead of `/auth`
- "Get Started" buttons link to `/auth`
- Already authenticated users visiting `/landing` redirect to `/`

## Technical Details

### `src/pages/Landing.tsx`
- Uses existing UI components (Button, Card) and Lucide icons
- Follows the dark theme with orange gradient accents from `index.css`
- Uses `animate-fade-in` and stagger classes for scroll entrance effects
- Fully responsive with mobile-first layout
- No new dependencies needed

### `src/App.tsx`
- Add: `import Landing from "./pages/Landing";`
- Add route: `<Route path="/landing" element={<Landing />} />`

### `src/components/ProtectedRoute.tsx`
- Change the unauthenticated redirect from `/auth` to `/landing`

