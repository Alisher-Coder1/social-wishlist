social-wishlist
│
├─ public
│   └─ images
│
├─ src
│
│  ├─ app
│  │
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │
│  │  ├─ auth
│  │  │   ├─ login
│  │  │   │   └─ page.tsx
│  │  │   └─ register
│  │  │       └─ page.tsx
│  │
│  │  ├─ dashboard
│  │  │   └─ page.tsx
│  │
│  │  ├─ wishlist
│  │  │   ├─ create
│  │  │   │   └─ page.tsx
│  │  │   └─ [id]
│  │  │       └─ page.tsx
│  │
│  │  └─ w
│  │      └─ [publicId]
│  │          └─ page.tsx
│  │
│  ├─ components
│  │
│  │  ├─ ui
│  │  │   ├─ Button.tsx
│  │  │   ├─ Card.tsx
│  │  │   ├─ Input.tsx
│  │  │   └─ ProgressBar.tsx
│  │
│  │  ├─ wishlist
│  │  │   ├─ WishlistCard.tsx
│  │  │   ├─ ItemCard.tsx
│  │  │   └─ ContributionModal.tsx
│  │
│  │  └─ layout
│  │      ├─ Navbar.tsx
│  │      └─ Container.tsx
│
│  ├─ lib
│  │
│  │  ├─ supabase.ts
│  │  ├─ auth.ts
│  │  └─ utils.ts
│
│  ├─ services
│  │
│  │  ├─ wishlistService.ts
│  │  ├─ itemService.ts
│  │  ├─ reservationService.ts
│  │  └─ contributionService.ts
│
│  ├─ types
│  │
│  │  ├─ wishlist.ts
│  │  ├─ item.ts
│  │  ├─ reservation.ts
│  │  └─ contribution.ts
│
│  └─ styles
│      └─ globals.css
│
├─ .env.local
├─ roadmap.md
├─ package.json
├─ tsconfig.json
├─ next.config.ts
└─ README.md