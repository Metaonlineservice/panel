# META ONLINE SERVICE — Global Visa Processing Platform

A professional visa management SaaS platform with an applicant portal, admin panel, email automation, multi-language support (English / Persian / Arabic), and a navy/white/gold corporate design.

**No SQL database.** The entire backend uses **Google Sheets** as the only database, **Google Drive** for file storage, and **SMTP/Gmail** for email. Authentication is custom JWT with bcrypt password hashing.

## Architecture

```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS
Backend:   Node.js + Express + TypeScript
Database:  Google Sheets (via googleapis)
Storage:   Google Drive
Email:     SMTP via nodemailer (editable HTML templates stored in Sheets)
Auth:      Custom JWT + bcrypt
```

## Project Structure

```
/
├── src/                      # React frontend
│   ├── components/           # UI components + shells (Public, Dashboard, Admin)
│   ├── context/              # Auth, Theme, I18n contexts
│   ├── lib/                  # api client, types
│   └── pages/                # public, auth, applicant, admin pages
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── config.ts
│   │   ├── google/           # Google API client
│   │   ├── sheets/           # sheet specs + repository
│   │   ├── services/         # googleSheetsService, drive, email, notify
│   │   ├── auth/             # JWT middleware
│   │   ├── routes/           # auth, public, applicant, admin
│   │   ├── scripts/          # setupSheets, seedRequirements
│   │   └── data/             # 150+ visa requirements seed data
│   └── .env.example
└── package.json
```

## Setup

### 1. Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Google Sheets API** and **Google Drive API**.
4. Go to **IAM & Admin → Service Accounts → Create service account**.
5. Create a key (JSON) and download it.
6. Note the service account email (looks like `name@project.iam.gserviceaccount.com`).

### 2. Google Sheet

1. Create a new Google Sheet.
2. Share it with the service account email (Editor access).
3. Copy the spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/<ID>/edit`).

### 3. Google Drive (file storage)

1. Create a folder in Google Drive for uploaded documents.
2. Share the folder with the service account email (Editor access).
3. Copy the folder ID from the URL.

### 4. Backend environment

Copy `backend/.env.example` to `backend/.env` and fill in:

```
PORT=4000
JWT_SECRET=your-long-random-secret
BOOTSTRAP_ADMIN_SECRET=your-bootstrap-secret

GOOGLE_SERVICE_ACCOUNT_EMAIL=name@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# OR
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=/path/to/service-account.json

GOOGLE_SHEETS_SPREADSHEET_ID=<your-sheet-id>
GOOGLE_DRIVE_FOLDER_ID=<your-drive-folder-id>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="META ONLINE SERVICE <noreply@metaonlineservice.com>"
```

### 5. Initialize the sheets

```bash
cd backend
npm install
npm run setup:sheets      # creates all 9 sheets with headers + default email templates
npm run seed:requirements # seeds 150+ country visa requirements
npm run dev               # start the API on http://localhost:4000
```

### 6. Create the first admin

With the backend running, open `http://localhost:4000` and use the **Admin Portal → Bootstrap admin** flow (or POST `/api/auth/bootstrap-admin` with `secret`, `email`, `fullName`), then sign in.

### 7. Frontend

```bash
npm install
npm run dev      # starts Vite dev server
```

The frontend expects `VITE_API_URL=http://localhost:4000/api` in `.env`.

## Google Sheets schema (9 sheets)

| Sheet | Purpose |
|---|---|
| Applicants | User accounts (id, full_name, email, password_hash, phone, country, nationality, passport_number, date_of_birth, created_at, status, role) |
| Visa Applications | Applications (application_id, applicant_id, visa_country, visa_type, status, assigned_agent, priority, created_at, updated_at, notes) |
| Visa Requirements | Public country/visa data (country, visa_type, documents, processing_time, fees, eligibility, steps, embassy_information) |
| Documents | Uploaded files (document_id, applicant_id, document_name, file_url, verification_status, uploaded_at) |
| Payments | Invoices (payment_id, applicant_id, amount, currency, status, date, invoice_number, application_id) |
| Email Templates | Editable HTML templates (template_id, name, subject, html_body) |
| Messages | Applicant↔admin chat (message_id, applicant_id, sender, sender_role, subject, message, date, read_by_applicant, read_by_admin) |
| Notifications | In-app notifications (notification_id, applicant_id, title, message, read_status, created_at, type) |
| Application History | Status change log (history_id, application_id, old_status, new_status, changed_by, date, note) |

## Roles

- **Applicant** — applies for visas, uploads documents, messages support, tracks status.
- **Agent** — staff role with access to the admin panel.
- **Admin** — full access including user management and email templates.

## Languages

English, Persian (فارسی), and Arabic (العربية) with automatic RTL layout for Persian and Arabic. Toggle from the navbar or dashboard header.

## License

© META ONLINE SERVICE. All rights reserved.
