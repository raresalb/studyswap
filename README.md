# StudySwap 🎓

O platformă educațională și socială completă pentru studenți din România.

## Stack Tehnic

| Layer | Tehnologie |
|-------|-----------|
| Frontend | Next.js 15 + React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js App Router API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (Google, GitHub, Credentials) |
| Fișiere | Cloudinary |
| Plăți | Stripe (checkout, webhooks) |
| AI | Anthropic Claude API (claude-opus-4-6) |
| Real-time | Socket.io |
| Animații | Framer Motion |

## Setup rapid

### 1. Clonează și instalează dependențele
```bash
cd studyswap
npm install
```

### 2. Configurează variabilele de mediu
```bash
cp .env.example .env
# Completează toate valorile din .env
```

### 3. Configurează baza de date
```bash
# Asigură-te că PostgreSQL rulează
npm run db:push      # Aplică schema
npm run db:seed      # Populează cu date demo
npm run db:studio    # Deschide Prisma Studio (opțional)
```

### 4. Pornește aplicația
```bash
npm run dev
# Accesează http://localhost:3000
```

## Conturi Demo (după seed)

| Rol | Email | Parolă |
|-----|-------|--------|
| Admin | admin@studyswap.ro | admin123! |
| Student | ion.popescu@studyswap.ro | student123! |
| Student | andrei.gheorghe@studyswap.ro | student123! |
| Companie | hr@techstartup.ro | company123! |

## Structura Proiectului

```
studyswap/
├── app/
│   ├── (auth)/              # Login, Register
│   ├── (dashboard)/         # Zona studenți
│   │   ├── feed/            # Feed principal
│   │   ├── marketplace/     # Materiale studiu
│   │   ├── tutoring/        # Sesiuni tutoriat
│   │   ├── wallet/          # Credite & plăți
│   │   ├── jobs/            # Joburi & internshipuri
│   │   ├── messages/        # Chat privat
│   │   ├── community/       # Forum
│   │   ├── ai/              # Asistent AI
│   │   └── profile/         # Profil public
│   ├── (company)/           # Zona companii
│   ├── (admin)/             # Panou admin
│   └── api/                 # API Routes
├── components/              # Componente refolosibile
├── lib/                     # Utilitare (auth, db, ai, stripe)
├── prisma/                  # Schema + seed
└── types/                   # Type definitions
```

## Module Principale

### 1. Marketplace Materiale
- Upload PDF/DOCX/PPT cu moderare
- Sistem credite: gratuit (+5 cr/descărcare) sau premium
- Rating & recenzii
- Filtrare avansată

### 2. Sistem Credite
- **Câștigare**: materiale, tutoriat, recenzii, bonus zilnic, referral
- **Cumpărare**: pachete Stripe (100/500/1000 credite)
- **Retragere**: IBAN/PayPal, minim 500 credite, conversie 100cr=3€
- **Comision platformă**: 15% din tranzacții

### 3. Tutoriat P2P
- Sesiuni live cu calendar
- Integrare Jitsi pentru video call
- Booking cu credite

### 4. Joburi & Internshipuri
- Dashboard companii (postare, gestionare aplicanți)
- Dashboard studenți (aplicare, tracking status)
- Filtrare avansată

### 5. AI Features (Claude Opus)
- Rezumat automat documente
- Generare quiz (10 întrebări)
- Asistent studiu chatbot
- Matching tutori

### 6. GDPR
- Ștergere cont și date (Right to erasure)
- KYC pentru retrageri (upload buletin)
- Politică confidențialitate

## Configurare Stripe Webhook

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## Deploy

```bash
npm run build
npm run start
```
