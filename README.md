# NoteAdda 📚✨

> A modern educational marketplace empowering students and creators to monetize their knowledge, while providing learners seamless access to verified, high-quality study materials.

---

## 📖 Overview

**NoteAdda** is an educational digital marketplace designed to bridge the gap between quality study resources and student accessibility. Built initially for higher education and professional test-takers across universities and colleges, NoteAdda operates on a two-sided marketplace model:

$$\text{Upload} \longrightarrow \text{Price} \longrightarrow \text{Discover} \longrightarrow \text{Purchase} \longrightarrow \text{Access} \longrightarrow \text{Earn}$$

Unlike generic file-sharing drives or single-university portals, NoteAdda treats educational documents as real digital products—featuring previews, ratings, search indexing, secure payment flows, and digital download access control.

---

## 🎯 Core Features

### 🔍 For Buyers (Learners)
* **Marketplace Discovery:** Discover notes by category, university, faculty, course, and semester.
* **Instant & Layered Search:** Query-specific notes (e.g., *"DBMS 4th semester"*, *"Engineering Mathematics"*).
* **Transparent Document Previews:** Preview select pages and evaluate contents before making a purchase.
* **Verified Reviews & Ratings:** Make informed decisions backed by feedback from verified buyers.
* **Buyer Dashboard:** Instant library access to purchased materials, download management, and saved wishlists.

### 💼 For Sellers (Students, Tutors & Creators)
* **Streamlined Upload Flow:** Upload PDF/digital notes, set custom prices (e.g., `Rs. 199`), add previews, and publish.
* **Seller Dashboard:** Real-time metrics including total revenue, order counts, pending earnings, and buyer reviews.
* **Unified Account System:** Every authenticated user can seamlessly act as both a buyer and a seller without switching accounts.
* **Earnings & Payout Tracking:** Clear ledger of sales, net earnings, and withdrawal management.

### 🛡️ Trust & Security
* **Backend-Verified Transactions:** Payments are strictly authorized and verified server-side.
* **Controlled Digital Access:** No public/guessable links for paid assets; download tokens and private storage access ensure content protection.
* **Moderation & Flagging:** Content review flows and copyright complaint mechanisms.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite) + TypeScript** | High-performance SPA with type safety |
| **Styling** | **Tailwind CSS** | Clean, responsive, marketplace-grade UI design |
| **Backend API** | **Laravel (PHP)** | Modular REST API with robust service architecture |
| **Authentication** | **Laravel Sanctum** | Token-based SPA/mobile authentication |
| **Database** | **MySQL** | Relational data persistence with strict foreign keys & indexing |
| **Caching & Queues** *(Roadmap)* | **Redis + Laravel Queues** | Asynchronous email, PDF thumbnailing, and fast caching |
| **Search Engine** *(Roadmap)* | **Meilisearch** | Typo-tolerant, fast, full-text catalog search |
| **Storage** *(Roadmap)* | **S3-compatible Object Storage** | Secure, private storage for digital assets |

---

## 🏛️ Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│            React + TypeScript + Tailwind CSS           │
│        (Buyer Catalog, Seller Dashboard, Checkout)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ REST API (JSON / Sanctum Auth)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Laravel REST Backend                  │
│   Controllers  ──►  Form Requests  ──►  Services       │
│   Policies     ──►  Eloquent ORM   ──►  API Resources  │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│          MySQL           │  │   Redis / Background     │
│   (Users, Notes, Orders) │  │   (Queues, Cache, Jobs)  │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 📂 Project Structure

```text
noteadda/
├── backend/                  # Laravel REST API application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # Clean, thin HTTP controllers
│   │   │   ├── Requests/     # Validation rules
│   │   │   └── Resources/    # JSON resource transformers
│   │   ├── Models/           # Eloquent entities
│   │   ├── Policies/         # Resource authorization
│   │   └── Services/         # Core business logic
│   ├── database/
│   │   └── migrations/       # Normalized relational schemas
│   └── routes/
│       └── api.php           # REST endpoints
│
└── frontend/                 # React + TypeScript + Vite SPA
    ├── src/
    │   ├── assets/           # Static media, icons
    │   ├── components/       # Reusable UI (Buttons, Cards, Inputs)
    │   │   ├── common/
    │   │   ├── marketplace/  # NoteCard, Filters, SearchBar
    │   │   └── dashboard/
    │   ├── features/         # Domain-driven features (auth, notes, orders)
    │   ├── hooks/            # Custom reusable React hooks
    │   ├── layouts/          # Marketplace, Dashboard, and Auth layouts
    │   ├── services/         # Axios / Fetch API client abstractions
    │   ├── types/            # TypeScript interfaces and types
    │   └── utils/            # Helper formatters (currency, dates)
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18+) & **npm** / **pnpm**
* **PHP** (8.2+) & **Composer**
* **MySQL** (8.0+)

---

### Backend Setup (Laravel)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Update your database credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) in `.env`.*

4. **Run migrations & seeders:**
   ```bash
   php artisan migrate --seed
   ```

5. **Start the Laravel API server:**
   ```bash
   php artisan serve
   ```
   *The backend will boot at `http://127.0.0.1:8000`.*

---

### Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   *Ensure `VITE_API_BASE_URL` points to `http://127.0.0.1:8000/api`.*

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   *The frontend will boot at `http://localhost:5173`.*

---

## 🗺️ Product Roadmap

- [x] **Phase 1: Foundation** — Authentication (Sanctum), base responsive UI system, user profile management.
- [ ] **Phase 2: Notes Engine** — University/course taxonomy, note upload, file handling, catalog browsing & filtering.
- [ ] **Phase 3: Marketplace & Dashboards** — Orders, purchases, seller revenue ledger, buyer download center.
- [ ] **Phase 4: Payments & Payouts** — Localized payment gateway integration, transaction verification, payout requests.
- [ ] **Phase 5: Infrastructure & Optimization** — Meilisearch indexing, asynchronous queues, secure S3 presigned asset delivery.

---

## 📐 Engineering Principles

1. **Marketplace First:** Every feature must reinforce either the buyer's journey (*Discover $\rightarrow$ Evaluate $\rightarrow$ Buy $\rightarrow$ Access*) or the seller's journey (*Upload $\rightarrow$ Price $\rightarrow$ Sell $\rightarrow$ Earn*).
2. **Thin Controllers, Rich Services:** Keep Laravel controllers isolated to request dispatching; encapsulate complex transaction rules in dedicated Service classes.
3. **No Blind Trust:** Never verify digital purchases on client-side confirmation alone; always reconcile against backend payment webhooks and signatures.
4. **Mobile Prioritized:** Ensure responsive layouts with touch-friendly navigation, sticky purchase CTAs, and fast document preview load times.

---

## 📄 License

This repository is maintained for the NoteAdda platform. All rights reserved.
