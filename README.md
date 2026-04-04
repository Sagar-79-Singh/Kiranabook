# 🛒 Sagar Stationery — Setup Guide

---

## STEP 1 — freesqldatabase.com pe Tables Banao

1. freesqldatabase.com pe login karo
2. phpMyAdmin open karo
3. Left mein apna database select karo
4. "SQL" tab pe click karo
5. `db/schema.sql` ka POORA content paste karo
6. "Go" press karo — sab tables ban jayenge ✅

---

## STEP 2 — GitHub New Repo Banao

1. github.com → "+" → New repository
2. Name: `kiranabook`, Private
3. Create karo
4. Apne PC pe ZIP extract karo, terminal kholo:

   git init
   git add .
   git commit -m "KiranaBook init"
   git branch -M main
   git remote add origin https://github.com/TERA_USERNAME/kiranabook.git
   git push -u origin main

---

## STEP 3 — Vercel New Project Banao

1. vercel.com → "Add New Project"
2. GitHub se `kiranabook` repo import karo
3. Framework: Other
4. "Deploy" click karo

---

## STEP 4 — Vercel Environment Variables

Settings → Environment Variables mein ye add karo:

   DB_HOST     = freesqldatabase.com ka host
   DB_PORT     = 3306
   DB_USER     = tumhara username
   DB_PASS     = tumhara password
   DB_NAME     = tumhara database name
   JWT_SECRET  = kiranabook2024secret (ya kuch bhi random)

Save → Redeploy karo (ya vercel --prod)

---

## STEP 5 — Users Setup (One Time)

Browser mein kholo:

   https://tumhari-app.vercel.app/api/setup?key=kiranabook_setup_2024

Response aayega:
   { "success": true, "users": [{"username":"admin"}, {"username":"dad"}] }

---

## STEP 6 — Login Karo!

   https://tumhari-app.vercel.app

   admin / admin123 → Admin (sab kuch + delete)
   dad   / dad123   → User (delete nahi kar sakta)

---

## Future Updates

   git add .
   git commit -m "change description"
   git push

Vercel auto-deploy karega. Ya manually: vercel --prod

---

## API Files (12 total)

   api/_db.js       → Database connection
   api/_auth.js     → JWT auth helper
   api/login.js     → Login
   api/setup.js     → One-time user setup
   api/masters.js   → Units + Groups
   api/items.js     → Items CRUD
   api/parties.js   → Customers + Suppliers
   api/sales.js     → Sales
   api/purchases.js → Purchases
   api/payments.js  → Payments
   api/ledger.js    → Ledger
   api/reports.js   → Dashboard + Stock
