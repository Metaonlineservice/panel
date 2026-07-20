# Google Sheets Database Setup Guide

This guide walks you through setting up Google Sheets as the sole database for META ONLINE SERVICE. There is **no SQL database** anywhere in this project — Google Sheets handles all data persistence via the Google Sheets API.

---

## Step 1: Upload the Excel Template to Google Sheets

1. Locate the file `META_Online_Service_Database_Template.xlsx` in the project root.
2. Go to [Google Sheets](https://sheets.google.com) and click **Blank** (or go to [Google Drive](https://drive.google.com) → **New** → **File upload**).
3. **Option A — Direct upload:** Drag the `.xlsx` file into Google Drive, then double-click it and select **Open with Google Sheets**.
4. **Option B — Import:** In a blank Google Sheet, click **File → Import → Upload**, select the `.xlsx` file, and choose **Replace spreadsheet**.
5. Verify all 10 tabs are present:
   - Applicants, Visa Applications, Visa Requirements, Documents, Payments, Email Templates, Messages, Notifications, Application History, Admins
6. Each sheet already contains the correct column headers in row 1 and 5 realistic sample records.

> **Important:** Do not delete or rename any sheet tabs or column headers — the backend reads and writes by these exact names.

---

## Step 2: Copy the Spreadsheet ID

1. Open your uploaded Google Sheet.
2. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/1ABCdefGHIjklMNOpqrsTUVwxyz/edit#gid=0
                                        └─────────── this is the ID ──────┘
   ```
3. Copy the long string between `/d/` and `/edit` — this is your **GOOGLE_SHEET_ID**.

---

## Step 3: Enable the Google Sheets API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and **create a new project** (e.g., `meta-online-service`).
3. In the sidebar, go to **APIs & Services → Library**.
4. Search for **Google Sheets API** and click **Enable**.
5. Search for **Google Drive API** and click **Enable** (needed for file uploads).

---

## Step 4: Create a Google Service Account

A Service Account is a special Google account that lets your backend authenticate with the Sheets API without any human login.

1. In the Cloud Console, go to **IAM & Admin → Service Accounts**.
2. Click **Create Service Account**.
3. Name it (e.g., `meta-sheets-bot`), add a description, and click **Create and Continue**.
4. Skip the role assignment (click **Continue**, then **Done**).
5. Find your new service account in the list and click it.
6. Go to the **Keys** tab → **Add Key → Create new key**.
7. Choose **JSON** and click **Create**. A `.json` file downloads automatically.

The downloaded JSON file contains fields like:
```json
{
  "type": "service_account",
  "project_id": "meta-online-service",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "meta-sheets-bot@meta-online-service.iam.gserviceaccount.com",
  ...
}
```

> **Keep this file secure.** It grants API access to your project. Do not commit it to GitHub.

---

## Step 5: Share the Spreadsheet with the Service Account

The service account email (the `client_email` field from the JSON) needs Editor access to your Google Sheet.

1. Open your Google Sheet in the browser.
2. Click the green **Share** button (top right).
3. Paste the service account email (e.g., `meta-sheets-bot@meta-online-service.iam.gserviceaccount.com`).
4. Set the role to **Editor**.
5. Uncheck "Notify people" (service accounts have no inbox).
6. Click **Share**.

---

## Step 6: (Optional) Share a Google Drive Folder for File Storage

For document uploads (passports, bank statements, etc.):

1. Create a folder in Google Drive (e.g., `META Documents`).
2. Share it with the same service account email as **Editor**.
3. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/1ABCdefGHIjklMNOpqrsTUVwxyz
                                           └─── this is the folder ID ──┘
   ```

---

## Step 7: Configure Your `.env` File

Create or update the `.env` file in your project root (or `backend/.env` for the Node.js backend) with these values:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=1ABCdefGHIjklMNOpqrsTUVwxyz
GOOGLE_CLIENT_EMAIL=meta-sheets-bot@meta-online-service.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n

# Optional: Google Drive for file storage
GOOGLE_DRIVE_FOLDER_ID=1ABCdefGHIjklMNOpqrsTUVwxyz
```

### Important notes about `GOOGLE_PRIVATE_KEY`

- Copy the entire `private_key` value from the JSON file.
- Keep the `\n` escape sequences — they represent real newlines. The service code converts them automatically.
- Wrap the value in quotes if your `.env` parser requires it:
  ```
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
  ```

### Alternative: Use the JSON key file path

If you prefer not to paste the private key inline, you can place the downloaded JSON file on your server and reference it:

```env
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=/path/to/meta-sheets-bot.json
```

The `googleSheetsService.ts` checks for both inline credentials and the key file path.

---

## Step 8: Verify the Connection

Start your backend and check that it can read from the sheet:

```bash
npm run dev
```

If the credentials are missing, you'll see a warning in the console:
```
[googleSheetsService] Missing Google credentials. Set GOOGLE_SHEET_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY in .env
```

If the credentials are correct but the sheet isn't shared, you'll get a `403 The caller does not have permission` error — go back to Step 5.

---

## Sheet Schema Reference

| # | Sheet Name | Key Column | Columns |
|---|-----------|-----------|---------|
| 1 | Applicants | `id` | id, full_name, email, password_hash, phone, country, nationality, passport_number, date_of_birth, created_at, status, role |
| 2 | Visa Applications | `application_id` | application_id, applicant_id, visa_country, visa_type, status, assigned_agent, priority, created_at, updated_at, notes |
| 3 | Visa Requirements | `country` + `visa_type` | country, visa_type, documents, processing_time, fees, eligibility, steps, embassy_information |
| 4 | Documents | `document_id` | document_id, applicant_id, document_name, file_url, verification_status, uploaded_at |
| 5 | Payments | `payment_id` | payment_id, applicant_id, amount, currency, status, date, invoice_number, application_id |
| 6 | Email Templates | `name` | template_id, name, subject, html_body |
| 7 | Messages | `message_id` | message_id, applicant_id, sender, sender_role, subject, message, date, read_by_applicant, read_by_admin |
| 8 | Notifications | `notification_id` | notification_id, applicant_id, title, message, read_status, created_at, type |
| 9 | Application History | `history_id` | history_id, application_id, old_status, new_status, changed_by, date, note |
| 10 | Admins | `admin_id` | admin_id, full_name, email, password_hash, role, created_at, last_login, status |

---

## How the Service Works

The `googleSheetsService.ts` file in `src/services/` provides a complete CRUD layer over Google Sheets:

- **`readAll(sheetName)`** — fetches every row as an array of objects keyed by column header.
- **`readRow(sheetName, predicate)`** — finds the first row matching a predicate.
- **`readRows(sheetName, predicate)`** — filters rows by predicate.
- **`appendRow(sheetName, row)`** — appends a new row at the bottom.
- **`updateRow(sheetName, predicate, patch)`** — merges a patch into the first matching row.
- **`updateRows(sheetName, predicate, patch)`** — bulk-updates all matching rows.
- **`deleteRow(sheetName, predicate)`** — deletes the first matching row.
- **`ensureSheet(sheetName)`** — auto-creates a sheet tab with headers if it doesn't exist.

Each domain entity (Applicants, Visa Applications, etc.) has dedicated methods like `getApplicantByEmail`, `createVisaApplication`, `updateVisaStatus`, `markNotificationRead`, etc. IDs are auto-generated with prefixes (`APP_`, `VISA_`, `DOC_`, `PAY_`, `MSG_`, `NOT_`, `HIST_`, `ADM_`).

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing Google credentials` warning | Ensure all three env vars are set in `.env` |
| `403 The caller does not have permission` | Share the spreadsheet with the service account email (Step 5) |
| `404 Unable to parse range` | Sheet tab name is misspelled or was renamed — match the exact names above |
| `invalid_grant` / `invalid_signature` | The private key was corrupted during copy-paste — re-copy it from the JSON file |
| Sheets API not enabled | Go back to Step 3 and enable both Sheets and Drive APIs |

---

## Security Notes

- Never commit the service account JSON file or `.env` to GitHub.
- Add `.env` and `*.json` (service account keys) to your `.gitignore`.
- The service account only has access to resources explicitly shared with it.
- Password hashes in the `Applicants` and `Admins` sheets use bcrypt — never store plaintext passwords.
