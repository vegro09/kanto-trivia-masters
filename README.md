# Kanto Trivia Masters

Build a fully client-side, local-first interactive Trivia & Quiz Party Game in Arabic, adhering strictly to the "Kanto Empire Design Constitution" with zero external dependencies, no login/auth, and no generic AI aesthetic.

---

### 1. CORE BRANDING & DESIGN CONSTITUTION (KANTO SYSTEM)
- **Visual Identity:** Luxury minimalist, high-end editorial, zero decorative clutter or bloated generic cards[cite: 1].
- **Palette (Strict Triad):**
  - Kanto Black (`#000000`): Master canvas and high-contrast containers[cite: 1].
  - Kanto Cream (`#F5F5DC`): Primary typography, warm highlights, and subtle background surfaces[cite: 1].
  - Kanto White (`#FFFFFF`): Crisp contrast elements, active states, and borders[cite: 1].
  - Functional Accents (Strictly for feedback/scoring/economy): Semantic Green (`#10B981`) for correct/success, Semantic Red (`#EF4444`) for wrong/deductions[cite: 1].
- **Aesthetic Style (Dynamic Flat UI):** Flat solid fills, crisp 1px solid structural borders (`#333333` on dark / `#E5E5D8` on light), exact `8px` corner radius, NO glassmorphism, NO diffuse floating drop-shadows, and NO arbitrary neon/gradients[cite: 1].
- **Typography & Direction:** 
  - Entire application must be strictly Right-to-Left (`dir="rtl"`), 100% in Arabic.
  - Primary UI Font: `Tajawal` or `IBM Plex Sans Arabic` for crisp, high-legibility readability[cite: 1].
  - Headlines & Titles: High-impact Arabic display font styling (`Aref Ruqaa` or bold architectural typography)[cite: 1].

---

### 2. LOCAL ECONOMY & UNLOCK SYSTEM (PERSISTED IN LOCALSTORAGE)
- **Coin Wallet (المحفظة):**
  - Stored in `localStorage`. Default initial balance: 0 coins (or small starter amount like 5 coins).
  - Prominent coin balance badge in the top navigation bar with a quick link to "شحن العملات".
- **Category Lock / Purchase System:**
  - `منوعات وثقافة عامة`: Default unlocked and free for all players.
  - `جغرافيا وعواصم`: Locked by default (Cost: 15 coins to permanently unlock).
  - `إسلاميات وتاريخ إسلامي`: Locked by default (Cost: 15 coins to permanently unlock).
  - `كرة قدم ورياضة`: Locked by default (Cost: 15 coins to permanently unlock).
  - `تاريخ وحضارات`: Locked by default (Cost: 15 coins to permanently unlock).
  - When clicking a locked category in the setup screen, a sleek confirmation modal appears displaying current balance, cost (15 coins), an "إلغاء قفل الحزمة" button, or a shortcut button to "شحن رصيد" if coins are insufficient.
  - Unlocked status is saved permanently in `localStorage`.

---

### 3. REWARDED ADS SIMULATION / COIN STORE SCREEN (متجر الشحن)
- Dedicated clean screen / drawer for "شحن العملات":
  - **خيار مشاهدة إعلان مكافأة (Rewarded Ad Simulation):**
    - Card offering "+5 عملات مقابل مشاهدة إعلان".
    - Clicking the button opens a clean full-screen interactive modal that simulates a 5-second video ad with a countdown timer (5.. 4.. 3.. 2.. 1.. إغلاق).
    - Upon completion, add +5 coins to the local balance with an elegant toast notification: "تمت إضافة 5 عملات إلى رصيدك بنجاح".
  - **مهام ومكافآت إضافية (اختيارية):**
    - مكافأة يومية (Daily Reward): زر يعطي +5 عملات مرة كل 24 ساعة (محفوظ بالتاريخ في `localStorage`).

---

### 4. GAMEPLAY ARCHITECTURE & SCREENS

#### Screen 1: الإعداد وبدء التحدي (Setup & Roster)
- Input field to add player names (supports 2 to 10 players) with instant badge/tag display and removal option.
- Category selection grid:
  - Unlocked categories have a clean selection checkmark.
  - Locked categories show a subtle lock icon with the badge "15 عملة" and trigger the unlock/purchase flow on click.
- Difficulty filters (سهل / متوسط / صعب).
- High-contrast "ابدأ التحدي" action button (active only when at least one unlocked category and 2+ players are selected).

#### Screen 2: ساحة السؤال ودور الحكم (Question Arena & Host Screen)
- Minimalist header: Current round counter, active category badge, difficulty indicator, and current question points.
- Question card: Prominent Arabic typography displaying the question clearly.
- Hidden Answer Container: An interactive "كشف الإجابة" button that reveals the answer smoothly for the host/players to verify.
- Live Player Scoring Matrix: Direct buttons for each player to award points according to the question's difficulty level (+1, +2, or +3), or deduct/skip.
- Next question button with clean slide/fade transitions.

#### Screen 3: لوحة الصدارة والنتائج (Live Standings & Final Podium)
- End-of-game victory podium highlighting the winner with a refined, understated aesthetic (trophy icon, point breakdown, and a "جولة جديدة" button to restart with the same players or reconfigure).

---

### 5. LOCAL DATA STRUCTURE
- Embedded dataset containing questions categorized across all 5 sections.
- Every question item must contain: `id`, `category`, `difficulty` (سهل: 1 نقطة, متوسط: 2 نقطة, صعب: 3 نقاط), `question`, and `answer`.
- No backend servers, no sign-in/auth, 100% responsive for phones, tablets, and desktop.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d999d191-06d2-42c8-817f-7f655e5ac033).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
