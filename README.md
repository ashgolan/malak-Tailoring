# מתפרת רושאן | Roshan Tailoring

מערכת ניהול מתפרת - שוואדר, אגטיות בתים ומחסנים, עבודות כבדות.

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + React Query + Zustand
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT

## Setup

### Server
```bash
cd server
cp .env.example .env
# Fill in MONGO_URI, ACCESS_TOKEN_SECRET, REACT_APP_ADMIN
npm install
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Collections (same field names as original)
- Sales, BouncedChecks, WorkerExpenses, Waybills
- PartialPayment, InstitutionTax, SaleToCompany
- Expense, SleevesBid, Bid, CompanyWithTask, Task
- Inventory, Provider, Contact, TaxValues, Event, User
