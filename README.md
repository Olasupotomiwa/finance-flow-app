# 📱 Freebuff — Smart Invoice & Receipt Generator

A cross-platform mobile application for freelancers, small businesses, and entrepreneurs to create, manage, and share professional invoices and receipts. Built with **Expo SDK 54**, **React Native 0.81**, **Supabase**, and **NativeWind**.

---

## 🚀 Features

### 🔐 Authentication
- Email/password sign up and sign in
- Forgot password flow with email reset link
- Persistent session management via Supabase Auth
- Protected routes — unauthenticated users are redirected to sign in

### 📄 Invoice Management
- **Create invoices** — client info, items with quantities/prices, discount (% or fixed), tax, notes
- **Edit invoices** — update any field on existing draft invoices
- **Invoice preview** — A4-proportioned template rendered on screen
- **Download as image** — saves to device gallery (with permission fallback to share)
- **Download as PDF** — generates print-ready PDF via `expo-print`
- **Share** — share as image or PDF to any app
- **Convert to receipt** — instantly create a receipt from an invoice with payment method selection
- **Invoice list** — searchable FlatList with pull-to-refresh

### 🧾 Receipt Management
- **Create receipts** — customer info, items, discount, tax, issuer details
- **Payment method selector** — Cash, Card, Bank Transfer, USSD, Mobile Money, Cheque, Other
- **Digital signature pad** — draw signatures directly on screen (SVG-based)
- **Receipt preview** — A4-proportioned template matching the invoice design
- **Download & share** — same image/PDF flow as invoices
- **Receipt list** — searchable with pull-to-refresh

### 🏢 Business Profile
- **Business info** — name, email, phone, address (street, LGA, state)
- **Business logo upload** — image picker → Supabase Storage → cached URL
- **Business signature upload** — appears on invoice and receipt templates
- **Bank details** — bank name, account name, account number

### ⚙️ Settings
- **Invoice template config** — enable/disable tax, discount, set defaults, currency, footer message
- **Receipt template config** — enable/disable tax, discount, signature requirement, issuer display, currency
- **Change password** — modal with current/new password fields
- **Delete account** — with confirmation dialog
- **Sign out** — with confirmation modal

### 🎨 Theming
- **Light & dark mode** — toggle from settings
- **Custom accent color** — choose from a palette of primary colors
- **NativeWind integration** — Tailwind CSS classes for styling
- **ThemeContext** — centralized theme state with React Context

### 🎓 Onboarding Tour
- **First-time user detection** — guided tour using `react-native-copilot`
- **Custom tooltips** — branded tooltip component for tour steps

---

## 📁 Project Structure

```
├── app/                          # Expo Router — file-based navigation
│   ├── _layout.tsx               # Root layout (providers, splash screen, fonts)
│   ├── index.tsx                 # Entry redirect
│   ├── splashscreen.tsx          # Custom animated splash screen
│   │
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab bar configuration & icons
│   │   ├── home.tsx              # Dashboard / home screen
│   │   ├── billing.tsx           # Invoice & receipt lists
│   │   ├── profile.tsx           # User profile view
│   │   └── settings.tsx          # App settings
│   │
│   ├── auth/                     # Authentication screens
│   │   ├── _layout.tsx           # Auth layout (no tabs)
│   │   ├── signin.tsx            # Sign in form
│   │   ├── signup.tsx            # Sign up form
│   │   ├── forgot-password.tsx   # Request password reset
│   │   ├── reset-password.tsx    # Set new password
│   │   └── email-sent.tsx        # Confirmation screen
│   │
│   ├── invoice/                  # Invoice screens
│   │   ├── create.tsx            # Create new invoice form
│   │   ├── edit.tsx              # Edit existing invoice form
│   │   └── [id].tsx              # Invoice preview & actions
│   │
│   ├── receipt/                  # Receipt screens
│   │   ├── create.tsx            # Create new receipt (with signature pad)
│   │   └── [id].tsx              # Receipt preview & actions
│   │
│   ├── settings/                 # Settings screens
│   │   ├── business-info.tsx     # Business details + logo + signature upload
│   │   ├── invoice-template.tsx  # Invoice template configuration
│   │   └── receipt-template.tsx  # Receipt template configuration
│   │
│   └── profile/
│       └── _layout.tsx           # Profile tab layout
│
├── components/                   # Reusable UI components
│   ├── Home/
│   │   ├── header.tsx            # Home screen header
│   │   └── skeletonloader.tsx    # Loading skeletons for dashboard
│   │
│   ├── Invoice/
│   │   ├── invoiceTemplate.tsx   # A4 invoice layout (ViewShot target)
│   │   ├── buildHtml.ts          # Generates PDF-ready HTML (mirrors template)
│   │   ├── invoice-list.tsx      # Searchable invoice list component
│   │   └── InvoiceSuccessModal.tsx # Post-creation success modal
│   │
│   ├── receipt/
│   │   ├── ReceiptTemplate.tsx   # A4 receipt layout (ViewShot target)
│   │   ├── buildHtml.ts          # Generates PDF-ready HTML (mirrors template)
│   │   └── receipt-list.tsx      # Searchable receipt list component
│   │
│   ├── Settings/
│   │   ├── SettingItem.tsx       # Reusable settings row
│   │   ├── ProfileNavItem.tsx    # Profile navigation item
│   │   ├── ChangePasswordModal.tsx # Password change modal
│   │   ├── DeleteAccountModal.tsx  # Account deletion modal
│   │   └── SignOutModal.tsx      # Sign out confirmation modal
│   │
│   ├── shared/
│   │   ├── FormComponents.tsx    # SectionHeader, InputField, PricingRow, Divider
│   │   ├── ShareSheet.tsx        # Bottom sheet for image/PDF share or download
│   │   └── currency.ts           # Currency symbol helper
│   │
│   ├── profile/
│   │   └── profileskeleton.tsx   # Loading skeleton for profile screen
│   │
│   ├── tour/
│   │   └── CustomTooltip.tsx     # Onboarding tour tooltip
│   │
│   ├── DebounceSearch.tsx        # Debounced search input
│   ├── loader.tsx                # Global loading spinner
│   ├── ProtectedRoute.tsx        # Auth guard wrapper
│   └── ThemeSelector.tsx         # Theme/accent color picker
│
├── context/                      # React Context providers
│   ├── Authcontext.tsx           # Supabase auth session & user state
│   ├── profileContext.tsx         # User profile CRUD & completion tracking
│   └── ThemeContext.tsx           # Theme mode (light/dark) & accent color
│
├── lib/
│   └── supabase.ts               # Supabase client initialization
│
├── hooks/
│   └── useThemedStyles.ts        # Hook for accessing theme colors
│
├── utils/
│   ├── globalflash.ts            # Splash screen state manager
│   └── FirstTimeUser.ts          # First-time user detection for onboarding
│
├── api/
│   └── profile.ts                # Server-side profile API helpers
│
├── assets/
│   ├── images/                   # App icons, splash images
│   └── font/                     # Custom app fonts
│
├── global.css                    # NativeWind / Tailwind base styles
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS config (for NativeWind)
├── babel.config.js               # Babel config (NativeWind preset)
├── metro.config.js               # Metro bundler config
├── app.json                      # Expo app configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React Native 0.81 + Expo SDK 54 |
| **Navigation** | Expo Router v6 (file-based routing) |
| **Styling** | NativeWind v4 (Tailwind CSS) + StyleSheet |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) |
| **State Management** | React Context (Auth, Profile, Theme) |
| **Language** | TypeScript 5.9 |
| **PDF Generation** | expo-print |
| **Image Capture** | react-native-view-shot |
| **Image Picker** | expo-image-picker |
| **File Sharing** | expo-sharing + expo-media-library |
| **SVG** | react-native-svg |
| **Charts** | react-native-chart-kit |
| **Onboarding** | react-native-copilot |
| **Icons** | @expo/vector-icons (Ionicons) |
| **Toasts** | react-native-toast-message |
| **Date Picker** | @react-native-community/datetimepicker |
| **Gestures** | react-native-gesture-handler + react-native-reanimated |

---

## 🧩 Architecture & Key Patterns

### Invoice & Receipt Generation
Both invoice and receipt follow a **dual-render** pattern:
1. **On-screen template** (`invoiceTemplate.tsx` / `ReceiptTemplate.tsx`) — React Native components rendered in a ViewShot for image capture
2. **PDF HTML** (`buildHtml.ts`) — identical layout rendered as HTML string for `expo-print` PDF generation

Both templates use **A4 paper dimensions** (210mm × 297mm aspect ratio) so captured images are print-ready.

### Signature System
- **Receipts** support drawn signatures via an SVG-based signature pad (paths stored and uploaded as `.svg` to Supabase Storage)
- **Business signature** — uploaded as an image in Business Info settings, displayed on invoice and receipt templates
- The receipt template falls back from customer-drawn signature → business uploaded signature → no signature

### Theme System
- `ThemeContext` provides `colors`, `effectiveTheme` (light/dark), and `accentColor`
- Accent color persists to Supabase profile and AsyncStorage
- All components consume colors from context — no hardcoded colors in UI

### Auth Flow
- `ProtectedRoute` wraps authenticated screens and redirects to sign-in
- `Authcontext` manages Supabase session listener
- `profileContext` fetches the user profile on auth state change

---

## 🏗️ Database Tables (Supabase)

| Table | Purpose |
|---|---|
| `users` | User profiles (business info, logo, signature, theme preferences) |
| `invoices` | Invoice records (client, dates, totals, status) |
| `invoice_items` | Line items for each invoice |
| `receipts` | Receipt records (customer, payment method, signature) |
| `receipt_items` | Line items for each receipt |
| `user_settings` | Invoice and receipt template configurations |

### Supabase Storage Buckets
- `business-logos` — business logos and signature images
- `signatures` — drawn receipt signatures (SVG files)

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Supabase project with the tables above

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd <project-name>

# Install dependencies
npm install

# Create your .env file with Supabase credentials
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF

# Start the development server
npx expo start
```

### SQL Setup

Run the following in your Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT,
  business_email TEXT,
  business_phone TEXT,
  street_address TEXT,
  state TEXT,
  lga TEXT,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  avatar_url TEXT,
  business_logo_url TEXT,
  business_signature_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  subtotal NUMERIC DEFAULT 0,
  discount_type TEXT,
  discount_value NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  notes TEXT,
  currency TEXT DEFAULT 'NGN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  issuer_name TEXT,
  subtotal NUMERIC DEFAULT 0,
  discount_type TEXT,
  discount_value NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'NGN',
  payment_method TEXT,
  has_signature BOOLEAN DEFAULT FALSE,
  signature_url TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt items
CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings (template configurations)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  invoice_config JSONB DEFAULT '{}',
  receipt_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `expo` ~54.0 | Core Expo SDK |
| `expo-router` ~6.0 | File-based routing |
| `@supabase/supabase-js` ^2.95 | Backend (Auth, DB, Storage) |
| `nativewind` ^4.2 | Tailwind CSS for React Native |
| `react-native-view-shot` 4.0 | Screen capture for image download |
| `expo-print` ~15.0 | PDF generation |
| `expo-sharing` ~14.0 | Share files to other apps |
| `expo-media-library` ~18.2 | Save images to device gallery |
| `expo-image-picker` ~17.0 | Pick images from camera roll |
| `react-native-svg` 15.12 | SVG rendering for signatures |
| `react-native-copilot` ^3.3 | Guided onboarding tour |
| `react-native-toast-message` ^2.3 | Toast notifications |
| `@react-native-community/datetimepicker` 8.4 | Date picker for invoice dates |

---

## 📱 App Screens

| Screen | Path | Description |
|---|---|---|
| Splash | `/splashscreen` | Animated brand intro with loading indicator |
| Sign In | `/auth/signin` | Email/password login |
| Sign Up | `/auth/signup` | New account registration |
| Forgot Password | `/auth/forgot-password` | Password reset request |
| Home | `/(tabs)/home` | Dashboard with stats and quick actions |
| Billing | `/(tabs)/billing` | Invoice and receipt lists |
| Profile | `/(tabs)/profile` | User profile with completion tracker |
| Settings | `/(tabs)/settings` | App settings and configurations |
| Create Invoice | `/invoice/create` | New invoice form |
| Edit Invoice | `/invoice/edit` | Edit existing invoice |
| Invoice Preview | `/invoice/[id]` | View, share, download, or convert invoice |
| Create Receipt | `/receipt/create` | New receipt form with signature pad |
| Receipt Preview | `/receipt/[id]` | View, share, or download receipt |
| Business Info | `/settings/business-info` | Business details, logo, and signature |
| Invoice Template | `/settings/invoice-template` | Configure invoice defaults |
| Receipt Template | `/settings/receipt-template` | Configure receipt defaults |

---

## 📄 License

This project is private and proprietary.
