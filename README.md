# CreatorBridge — Premier Creator-Brand Collaboration Marketplace

CreatorBridge is a production-ready, full-stack creator-brand collaboration marketplace designed for the Indian ecosystem. It connects consumer businesses and brands with content creators and influencers to discover opportunities, launch multi-step campaigns, draft brief-driven AI scripts, track deliverable calendars, collaborate through a 14-step workflow, and release milestone escrow payments.

---

## 🎨 Visual & Design System

- **Primary Purple**: `#6425E8`
- **Secondary Purple**: `#8B5CF6`
- **Light Lavender**: `#F2ECFF`
- **Soft Purple**: `#E8DDFF`
- **Main Background**: `#FAFAFF`
- **Card Background**: `#FFFFFF`
- **Primary Text**: `#17152F`
- **Secondary Text**: `#77758B`
- **Border**: `#EAE8F2`
- **Status Accents**: Green (`#16A36A`), Amber (`#F59E0B`), Red (`#EF4444`)
- **Typography**: Plus Jakarta Sans & Inter
- **Icons**: Lucide Icons
- **Cards**: 14–18px border radius with subtle shadows

---

## 🚀 Key Features

### 1. Landing Page (Homepage)
- **Bold Hero**: "Connect. Collaborate. Grow." with dual entry buttons: **"I'm a Brand"** and **"I'm a Creator"**.
- Floating benefit tags: *Grow Your Audience*, *Get Brand Deals*, *Partner with Top Brands*.
- **How It Works**: 3-step structured progression.
- **Popular Campaigns**: Live campaigns from top brands (boAt, Nykaa, Cult.fit, Zomato, The Minimalist, Ather Energy).
- **Featured Creators**: High-converting creators across Tech, Fashion, Food, Fitness, and Lifestyle.
- **Dual Value Proposition**: Dedicated comparison tabs for Brands vs Creators.
- **Testimonials, FAQ accordion & SaaS Footer**.

### 2. Dual Onboarding & 1-Click Role Switcher
- Dedicated **Brand Registration** (Business name, owner name, category, headquarters, work email, phone).
- Dedicated **Creator Registration** (Full name, Instagram handle, YouTube channel, categories, location, follower counts).
- **1-Click Active Role Switcher**: Switch instantly between Brand View and Creator Studio via the top navigation bar or sidebar.

### 3. Brand Owner Dashboard
- **4 Overview Statistics**: Total Campaigns, Active Collaborations, Content Delivered, Total Spend.
- **Active Campaigns Table**: Progress indicators, applicant badges, and quick details.
- **Recommended Creators Carousel**: Instant direct invites to campaigns.
- **Interactive Recharts Analytics**: Weekly/monthly reach, impressions, views, and ROI.
- **5-Step Campaign Creation Wizard**:
  - *Step 1*: Campaign Details & Objectives
  - *Step 2*: Target Audience & Platforms
  - *Step 3*: Budget & Timeline (Escrow protected)
  - *Step 4*: Deliverables (Reels, Stories, Posts, Videos) & AI Brief Guidelines
  - *Step 5*: Preview & Launch

### 4. Creator Studio Dashboard
- **4 Overview Statistics**: Total Cumulative Earnings, Active Collaborations, Pending Applications, Upcoming Content Deliveries.
- **Recommended Campaigns**: Matches based on follower size and categories with "Apply Now" CTA.
- **My Collaborations Tracker**: Real-time status pipeline pills.
- **Interactive Earnings Chart**: Area chart showing monthly milestone growth.
- **Profile Strength Meter**: 95% completion checklist.
- **Upcoming Deliveries**: Quick links to the Content Calendar.

### 5. Content Calendar for Creators
- **Multi-View Modes**: Month, Week, Day, and List views.
- **Automated Milestone Scheduling**: Enrolling into a collaboration automatically adds tasks for:
  - *Script Writing*
  - *Content Shooting*
  - *Video Editing*
  - *Content Submission*
  - *Brand Review*
  - *Final Publishing*
  - *Payment Due*
- Distinct subtle color codes for each task type with visual legend.
- Interactive task completion checkboxes with strike-through feedback.
- Personal task creation modal with priority and notes.

### 6. AI Script Writer (Brief-Driven Intelligence)
- **Step 1**: Ingests official brand brief guidelines (product benefits, key message, special offers, required CTA, restrictions) from boAt, Nykaa, Zomato, Cult.fit, or custom briefs.
- **Step 2**: Select content format (*Instagram Reel, Story, Post, YouTube Short, Video, Product Review*).
- **Step 3**: Select narrative style (*Storytelling, Informative, Entertaining, Trend-based, Emotional*) and language (*English, Hindi, Kannada, Hinglish*).
- **Step 4**: AI generation engine outputs:
  1. **Hook** (first 3 seconds attention grabber)
  2. **Scene-by-scene breakdown** (Visual instructions, Voiceover/dialogue, On-screen text)
  3. **Product placement notes**
  4. **Call to action (CTA)**
  5. **Caption and verified hashtags**
- Creators can **edit inline**, **regenerate**, **copy**, **export as text**, and **save directly to active collaborations**.
- Connects to Google Gemini API (`GEMINI_API_KEY`) with intelligent fallback brief follower.

### 7. 14-Step Campaign Collaboration Workflow
- Full lifecycle tracker:
  `Brief Received ➜ Script Generated ➜ Script Submitted ➜ Brand Script Review ➜ Content In Production ➜ Content Uploaded ➜ Brand Content Review ➜ Approved ➜ Milestone Escrow Released`.
- Brand can review and approve scripts or request revisions with notes.
- Creator can upload video preview links.
- Brand releases escrow payment with transaction ledger records.

### 8. Payments, Escrow & Invoicing
- Creator payout overview and bank deposit tracking.
- Brand budget allocation and escrow security.
- GST compliant tax invoice PDF generation preview.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router DOM.
- **Backend**: Node.js, Express REST API, CORS, Dotenv.
- **Persistence**: File-backed JSON database (`server/db.json`) syncing with client `localStorage`.
- **AI Engine**: Google Gemini API (`@google/genai` or Gemini REST) with domain-specific brief intelligence fallback.

---

## ⚡ Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Gemini API)
Create a `.env` file in the root directory:
```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Full-Stack Development
```bash
npm run dev
```
- Frontend Dev Server: `http://localhost:5173`
- Backend API Server: `http://localhost:3001`
- Built Production Preview: served directly by Express at `http://localhost:3001`
