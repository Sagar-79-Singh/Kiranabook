# KiranaBook — Shop Manager
Vercel + freesqldatabase.com

## API Files — Only 11 Total
api/_db.js, api/_auth.js, api/auth.js, api/masters.js, api/items.js
api/parties.js, api/sales.js, api/purchases.js, api/payments.js, api/ledger.js, api/reports.js

## STEP 1 — GitHub New Repo Banao
1. github.com → "+" → New repository → name: kiranabook → Create
2. Project folder mein run karo:
   git init
   git add .
   git commit -m "KiranaBook init"
   git branch -M main
   git remote add origin https://github.com/TERA_USERNAME/kiranabook.git
   git push -u origin main

## STEP 2 — Vercel New Project
1. vercel.com → Add New Project → kiranabook repo import karo
2. Environment Variables add karo:
   DB_HOST  = sql.freedb.tech  (freesqldatabase.com wala host)
   DB_PORT  = 3306
   DB_USER  = tera username
   DB_PASS  = tera password
   DB_NAME  = tera database name
   JWT_SECRET = kiranabook2024secret
3. Deploy karo

## STEP 3 — Database Setup (1 URL)
Browser mein kholo:
https://TERI-APP.vercel.app/api/auth?init=kiranabook_init_2024

Success response aaye = sab ready!

## STEP 4 — Login
admin / admin123  (Admin — sab kuch)
dad   / dad123    (User — delete nahi kar sakta)

## STEP 5 — Future Updates
git add . && git commit -m "change" && git push && vercel --prod
