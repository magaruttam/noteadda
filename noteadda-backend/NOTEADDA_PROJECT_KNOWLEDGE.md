# NoteAdda — Project Knowledge

## 1. Project Overview

**Project Name:** NoteAdda

**Product Type:** Educational digital marketplace

**Primary Market:** Nepal initially

**Primary Goal:** Allow students and other learners to buy and sell educational notes and study materials.

NoteAdda is designed as a marketplace where users can both **purchase educational materials and sell their own materials**.

The platform should not be restricted to a single university, college, course, or academic level.

---

# 2. Core Product Concept

NoteAdda connects people who have useful educational materials with people who need those materials.

The basic marketplace model is:

```text
Seller
   ↓
Upload educational material
   ↓
Add information
   ↓
Set price
   ↓
Publish
   ↓
Buyer discovers material
   ↓
Buyer views details/preview
   ↓
Buyer purchases
   ↓
Payment is verified
   ↓
Buyer receives access
   ↓
Seller earns money
```

The product should make this process simple and trustworthy.

---

# 3. Main Product Goal

The primary purpose of NoteAdda is:

> **Make it easy for students to find useful study materials while giving students and educational creators a way to earn money from their knowledge and notes.**

The product should focus heavily on:

- Discoverability
- Search
- Marketplace listings
- Note previews
- Purchasing
- Digital downloads/access
- Seller experience
- Seller earnings
- Trust

---

# 4. Target Users

## Buyers

Typical buyers are students or learners looking for useful educational materials.

They should be able to:

- Search notes
- Browse notes
- Filter notes
- View note details
- Preview notes
- See seller information
- See ratings/reviews
- Purchase notes
- Download/access purchased notes
- Save notes
- Review purchased notes

---

## Sellers

Sellers can be:

- Students
- Teachers
- Tutors
- Educational creators
- Other users with useful educational content

They should be able to:

- Upload notes
- Add descriptions
- Select categories
- Set prices
- Publish notes
- Manage notes
- Track purchases
- Track earnings
- View reviews
- Manage seller profile

A user can be both a buyer and a seller.

There should not be a requirement to create separate buyer and seller accounts.

---

# 5. Types of Content

NoteAdda can support different types of educational materials.

Examples:

- Handwritten notes
- PDF notes
- Digital notes
- Subject notes
- Chapter summaries
- Complete subject materials
- Important questions
- Past questions
- Question solutions
- Exam preparation materials
- Study guides
- Lab/practical materials
- Assignment/reference materials
- Revision materials
- Other useful educational documents

The content system should be flexible enough to support new types in the future.

---

# 6. Geographic Scope

The initial focus is **Nepal**.

The product should support the Nepali education ecosystem, including different universities and educational institutions.

Possible universities include:

- Tribhuvan University
- Kathmandu University
- Pokhara University
- Purbanchal University
- Mid-West University
- Far Western University
- Lumbini Buddhist University
- Other universities

However:

> NoteAdda is NOT a university-only platform.

The architecture should allow the platform to expand beyond Nepal and beyond university students in the future.

---

# 7. Homepage Purpose

The homepage should behave like a **modern marketplace homepage**.

It should not look like:

- A basic educational portal
- A university website
- A generic CRUD application
- An old-style student website

The homepage should quickly communicate:

> **Find useful study materials.**

and:

> **Sell your notes and earn money.**

---

# 8. Homepage Information Hierarchy

Recommended order:

```text
Navigation
     ↓
Hero + Search
     ↓
Popular / Trending Notes
     ↓
Categories
     ↓
University / Course discovery
     ↓
Recommended / Trending content
     ↓
Seller CTA
     ↓
Trust / Benefits
     ↓
Footer
```

The homepage should not try to expose every feature.

---

# 9. Hero Section

The hero should contain a strong value proposition.

Example headline:

> Find the notes that help you study smarter.

Supporting message:

> Discover useful study notes, summaries, past questions, and exam materials from students and educational creators.

Primary feature:

**Large search bar**

Example placeholder:

> Search notes, subjects, universities...

Possible search filters:

- University
- Course
- Semester
- Subject
- Category
- Exam

Search is one of the most important features of the product.

---

# 10. Popular Notes

Popular notes should appear near the top of the homepage.

Possible section names:

- Popular Notes
- Trending Notes
- Bestselling Notes
- Students Are Buying

Each note card should communicate:

- Note preview/thumbnail
- Title
- Subject
- University
- Course
- Semester where applicable
- Seller
- Rating
- Purchase count
- Price
- CTA

Example:

```text
┌─────────────────────────────┐
│        PDF PREVIEW          │
├─────────────────────────────┤
│ DBMS Complete Notes         │
│ BSc CSIT • 4th Semester     │
│                             │
│ ⭐ 4.8   124 purchases      │
│                             │
│ Rs. 199          View Note  │
└─────────────────────────────┘
```

Possible badges:

- Bestseller
- Popular
- New
- Highly Rated
- Verified

---

# 11. Categories

NoteAdda should support broad educational categories.

Possible categories:

- Computer Science
- Engineering
- Management
- Medical
- Science
- Education
- Humanities
- Law
- Entrance Preparation
- Exam Preparation
- General Study Materials

The category structure should remain flexible.

---

# 12. University and Academic Browsing

Users should be able to discover notes through academic hierarchy.

Possible hierarchy:

```text
University
   ↓
Faculty
   ↓
Course
   ↓
Semester
   ↓
Subject
   ↓
Notes
```

This hierarchy should help users who don't know the exact note title.

---

# 13. Search

Search is a core NoteAdda feature.

Users may search:

```text
DBMS 4th semester
Python programming notes
Engineering mathematics
BCA notes
Computer graphics important questions
TU notes
```

Search should eventually support filters such as:

- University
- Faculty
- Course
- Subject
- Semester
- Category
- Price
- Rating
- Document type
- Popularity
- Newest

The search experience should be fast and easy to understand.

---

# 14. Note Details Page

Each note should have a product/details page.

Important information:

- Preview
- Title
- Description
- Subject
- Course
- University
- Semester
- Category
- Number of pages where applicable
- What's included
- Seller
- Seller rating
- Note rating
- Reviews
- Purchase count
- Price
- Buy button
- Related notes

The page should help the buyer answer:

> Is this note useful enough for me to buy?

---

# 15. Seller Experience

The seller flow should be simple:

```text
Upload
   ↓
Describe
   ↓
Set Price
   ↓
Submit
   ↓
Publish
   ↓
Sell
   ↓
Earn
```

Possible upload fields:

- Title
- Description
- University
- Faculty
- Course
- Subject
- Semester
- Category
- Document type
- Price
- File
- Preview/thumbnail

Avoid unnecessary fields.

---

# 16. Seller Dashboard

Possible dashboard metrics:

- Total sales
- Total orders
- Total earnings
- Pending earnings
- Average rating
- Number of notes

Possible navigation:

```text
Dashboard
My Notes
Upload Note
Orders
Earnings
Reviews
Profile
Settings
```

The dashboard should focus on useful seller information rather than unnecessary charts.

---

# 17. Buyer Dashboard

Possible buyer navigation:

```text
My Purchases
Downloads
Wishlist
Reviews
Payment History
Profile
Settings
```

Purchased materials should be easy to access again.

---

# 18. Marketplace Purchase Flow

The intended flow is:

```text
Browse/Search
     ↓
Note Details
     ↓
Preview
     ↓
Buy
     ↓
Checkout
     ↓
Payment
     ↓
Payment Verification
     ↓
Order Created
     ↓
Purchase Created
     ↓
Buyer Gets Access
```

Payment should always be verified by the backend.

The frontend should never be trusted to determine whether a payment succeeded.

---

# 19. Seller Earnings

A seller should be able to see:

- Sales
- Gross revenue
- Platform fees if applicable
- Net earnings
- Pending earnings
- Available balance
- Withdrawals

The exact commission and withdrawal rules can be decided later.

The database should be designed so these rules can evolve.

---

# 20. Digital File Access

Paid documents should not simply have permanent public URLs.

A future secure flow should look like:

```text
Buyer
   ↓
Request download
   ↓
Backend checks purchase
   ↓
Authorization succeeds
   ↓
Temporary/private access
   ↓
File download
```

Actual implementation can evolve based on the selected storage provider.

---

# 21. Reviews and Ratings

Users should be able to review purchased materials.

A review can contain:

- Rating
- Comment
- Buyer information
- Purchase verification

Reviews should help future buyers determine whether a note is trustworthy.

Seller ratings and note ratings can be separate concepts.

---

# 22. Trust Features

Because NoteAdda involves paid digital content, trust is important.

Potential trust features:

- Seller ratings
- Note ratings
- Verified purchases
- Purchase counts
- Preview before purchase
- Secure payment
- Clear pricing
- Verified sellers
- Report content
- Copyright/reporting system
- Clear refund policy

Trust should be reflected in both product functionality and UI.

---

# 23. Design Direction

NoteAdda should have a:

- Modern
- Clean
- Professional
- Student-friendly
- Trustworthy
- Minimal
- Responsive
- Marketplace-oriented

visual style.

Avoid:

- Excessive gradients
- Too many colors
- Excessive animations
- Overly rounded UI
- Cluttered pages
- Generic admin-dashboard appearance
- Old educational portal styling

The product should feel like a real startup marketplace.

---

# 24. Visual Direction

Suggested primary colors:

- Deep blue
- Indigo
- Purple-blue

Possible accent:

- Orange
- Yellow
- Green

Use mostly:

- White
- Light gray
- Dark text
- Primary brand color
- Small accent color

Colors should be used intentionally rather than everywhere.

---

# 25. Mobile UX

Many users are expected to access NoteAdda using phones.

The application must be responsive.

Important mobile areas:

- Search
- Note browsing
- Note cards
- Note details
- Purchase CTA
- Upload form
- Seller dashboard
- Buyer purchases

Mobile design should not simply be a smaller desktop layout.

Consider:

- Thumb-friendly controls
- Clear CTAs
- Horizontal category scrolling
- Responsive cards
- Sticky purchase actions where appropriate
- Simple navigation

---

# 26. Technology Stack

## Frontend

**React**

**TypeScript**

**Vite**

**Tailwind CSS**

---

## Backend

**Laravel**

**PHP**

**REST API**

**Laravel Sanctum**

---

## Database

**MySQL**

---

## Future Infrastructure

**Redis**

For:

- Cache
- Queues
- Sessions where appropriate
- Rate limiting

**Laravel Queue**

For:

- Emails
- Notifications
- PDF processing
- Background tasks

**Meilisearch**

For advanced note search.

**Object Storage**

For PDFs, images, previews, and other uploaded files.

**Payment Gateway**

For purchasing notes and handling seller earnings.

---

# 27. System Architecture

Current planned architecture:

```text
┌──────────────────────────────┐
│       React + TypeScript     │
│          Frontend            │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│          Laravel             │
│        Backend/API            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│            MySQL             │
│          Database             │
└──────────────────────────────┘
```

Future infrastructure:

```text
                  React
                    │
                    ▼
                 Laravel
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
     MySQL        Redis      Meilisearch
       │
       ▼
 Object Storage
       │
       ▼
      PDFs
```

Payment gateway and email services will connect to Laravel.

---

# 28. Database Concepts

The system will likely require entities such as:

```text
User
Profile
University
Faculty
Course
Subject
Category
Note
NoteFile
NotePreview
Order
OrderItem
Payment
Purchase
Review
Wishlist
SellerEarning
Withdrawal
Notification
```

These are conceptual entities, not a final database schema.

Do not create every entity immediately.

The actual schema should be designed according to confirmed requirements.

---

# 29. Authentication

Use Laravel Sanctum for authentication between React and Laravel.

Possible account states:

- Guest
- Authenticated user
- Seller
- Admin

A normal authenticated user can become a seller.

Do not unnecessarily create separate buyer and seller accounts.

---

# 30. Authorization

Users should only be allowed to perform actions they have permission to perform.

Examples:

- Users can edit their own notes.
- Users cannot edit another seller's notes.
- Users can access purchased content.
- Users cannot access unpaid content.
- Sellers can view their own earnings.
- Users can review materials they purchased.
- Admins can moderate marketplace content.

Laravel Policies/Gates should be used where appropriate.

---

# 31. API Philosophy

The React frontend communicates with Laravel through REST APIs.

Example conceptual endpoints:

```text
GET    /api/notes
GET    /api/notes/{id}
POST   /api/notes
PUT    /api/notes/{id}
DELETE /api/notes/{id}

GET    /api/categories
GET    /api/universities

POST   /api/orders
GET    /api/orders

GET    /api/purchases

POST   /api/notes/{id}/reviews
```

These are examples, not a final API contract.

API naming and structure should remain consistent.

---

# 32. Development Philosophy

NoteAdda should be developed incrementally.

Do not build the entire platform at once.

Recommended development stages:

## Stage 1 — Foundation

- Laravel setup
- React setup
- MySQL
- Authentication
- Basic layout
- User profile

## Stage 2 — Notes

- Categories
- Universities
- Courses
- Subjects
- Note upload
- Note browsing
- Note details
- Search/filter

## Stage 3 — Marketplace

- Pricing
- Orders
- Purchases
- Digital access
- Seller dashboard
- Buyer dashboard

## Stage 4 — Payments

- Payment gateway
- Payment verification
- Seller earnings
- Withdrawals

## Stage 5 — Infrastructure

- Redis
- Queues
- Object storage
- Advanced search
- Email/notifications

## Stage 6 — Production

- Testing
- Security
- Performance
- Deployment
- Monitoring

---

# 33. MVP Focus

The MVP should focus on the minimum features required to validate the marketplace.

### Users

- Register
- Login
- Profile

### Notes

- Upload
- Browse
- Search
- Filter
- Details
- Preview
- Price

### Buyers

- Purchase
- View purchases
- Download/access purchased notes

### Sellers

- Upload notes
- Manage notes
- View sales
- View earnings

Do not add complex features before the core marketplace works.

---

# 34. Long-Term Possibilities

NoteAdda may eventually support:

- Mobile applications
- Educational courses
- Books
- Question banks
- Exam preparation
- Study guides
- Educational creators
- Creator profiles
- Personalized recommendations
- AI-powered search
- Multiple languages
- Multiple countries
- More payment methods

These are future possibilities, not MVP requirements.

---

# 35. Core Product Principle

Always remember:

> **NoteAdda is an educational marketplace first, not simply a notes-sharing website.**

The two most important user journeys are:

### Buyer

```text
Discover
   ↓
Evaluate
   ↓
Buy
   ↓
Access
```

### Seller

```text
Upload
   ↓
Price
   ↓
Sell
   ↓
Earn
```

Every major feature and design decision should support one or both of these journeys.

---

# 36. Product Vision

The long-term vision is:

> **Build a trusted marketplace where educational knowledge can be shared, discovered, and monetized.**

A student with valuable notes should be able to turn those notes into an income source.

A student who needs good study material should be able to find it quickly without searching through scattered websites, social media groups, messaging apps, or random files.

NoteAdda should bring these two sides together in one platform.

---

# 37. Important Context for AI Assistance

When working on NoteAdda:

- Treat this document as the project's baseline context.
- Do not assume NoteAdda is only for BSc CSIT.
- Do not assume it is only for one university.
- Do not turn the product into a simple file-sharing platform.
- Remember that selling and buying are core features.
- Keep the marketplace experience central.
- Prefer simple architecture for the MVP.
- Avoid unnecessary technologies.
- Consider both buyer and seller experiences.
- Prioritize mobile responsiveness.
- Consider security for payments and digital files.
- Preserve consistency between frontend, backend, database, and UX decisions.

The project should evolve gradually while maintaining a clear product identity.

---

# 38. One-Sentence Product Definition

**NoteAdda is a modern educational marketplace where students and educational creators can sell their study notes and learning materials, while learners can discover, purchase, and access useful educational resources.**