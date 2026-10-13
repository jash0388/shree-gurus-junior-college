# Google Sheets Integration Setup Guide

## Destination Spreadsheet
- **Spreadsheet URL**: [https://docs.google.com/spreadsheets/d/1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A/edit](https://docs.google.com/spreadsheets/d/1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A/edit)
- **Spreadsheet ID**: `1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A`
- **Target Sheet Tab**: `Sheet1`

---

## Required Column Schema (Row 1)

Row 1 contains the following 14 headers in exact order:

| Col # | Column Header | Value Description |
|:---:|:---|:---|
| 1 | **S.No.** | Sequential serial number (1, 2, 3...) assigned safely |
| 2 | **Registration ID** | Unique alphanumeric ID (e.g. `SG-261013123731`) |
| 3 | **Submission Date & Time** | Timestamp of submission (`YYYY-MM-DD HH:MM:SS`) |
| 4 | **Academic Year** | Selected academic session (e.g. `2026 - 2027` or `2027 - 2028`) |
| 5 | **State** | State of residence (e.g. `Andhra Pradesh`, `Telangana`) |
| 6 | **Campus Location & District** | Campus location / district (e.g. `Vijayawada (NTR Dist)`) |
| 7 | **Campus Type** | `Residential (A/C Class + Non-A/C Hostel + Food)`, `Semi-Residential`, or `Day Scholar` |
| 8 | **Selected Class** | `Class 11 / Inter 1st Year`, `Class 12 / Inter 2nd Year`, or `Long Term Repeaters` |
| 9 | **Selected Course / Program** | `BRAHMOS: IPE + NEET Medical (Bi.P.C)`, `TRISHUL: IPE + JEE Main (M.P.C)`, etc. |
| 10 | **Student Name** | Full name of student |
| 11 | **Email Address** | Student / parent email address (blank if not provided) |
| 12 | **Phone Number** | 10-digit mobile number |
| 13 | **Registration Source (Website Form / AI Chatbot)** | `Website Form` or `AI Chatbot` |
| 14 | **Registration Status** | `Pending` |

---

## Configuration Options

The backend supports two integration methods. Choose whichever fits your workflow best:

### Option A: Google Cloud Service Account (Direct Google Sheets API v4)

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Sheets API** for your project.
3. Under **IAM & Admin > Service Accounts**, create a service account (e.g., `shreegurus-sheets@your-project.iam.gserviceaccount.com`).
4. Generate and download a **JSON Key** for this service account.
5. In your Google Sheet (`1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A`):
   - Click the **Share** button in the top right.
   - Add the service account email as an **Editor**.
6. Set the environment variable in your hosting platform (Vercel / server):
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: Paste the entire JSON key contents (or base64 encoded).
   *(Alternatively set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`)*.

---

### Option B: Google Apps Script Webhook (Zero GCP Setup)

1. Open the spreadsheet: [https://docs.google.com/spreadsheets/d/1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A/edit](https://docs.google.com/spreadsheets/d/1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A/edit)
2. In the top menu, click **Extensions > Apps Script**.
3. Paste the following script into `Code.gs`:

```javascript
const REQUIRED_HEADERS = [
  "S.No.",
  "Registration ID",
  "Submission Date & Time",
  "Academic Year",
  "State",
  "Campus Location & District",
  "Campus Type",
  "Selected Class",
  "Selected Course / Program",
  "Student Name",
  "Email Address",
  "Phone Number",
  "Registration Source (Website Form / AI Chatbot)",
  "Registration Status"
];

// Adds a handy 1-click menu in Google Sheets
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚡ Shree Gurus Tools')
    .addItem('🗑️ Clear All Leads (Keep Headers)', 'clearTestData')
    .addToUi();
}

function clearTestData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Sheet1") || ss.getActiveSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
    SpreadsheetApp.getUi().alert("✅ Successfully cleared all rows! Headers preserved.");
  } else {
    SpreadsheetApp.getUi().alert("ℹ️ Sheet is already empty.");
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Sheet1") || ss.getActiveSheet();
    
    // Initialize headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(REQUIRED_HEADERS);
      sheet.getRange(1, 1, 1, REQUIRED_HEADERS.length).setFontWeight("bold");
    }
    
    var payload = JSON.parse(e.postData.contents);

    // Optional remote clear action
    if (payload.action === 'clear_data') {
      var lr = sheet.getLastRow();
      if (lr > 1) sheet.deleteRows(2, lr - 1);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Cleared all test data"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var regId = payload.registration_id;
    var rowValues = payload.row_values;
    
    // Duplicate prevention: check column B for existing Registration ID
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var existingIds = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (var i = 0; i < existingIds.length; i++) {
        if (existingIds[i][0] === regId) {
          return ContentService.createTextOutput(JSON.stringify({
            success: true,
            duplicate: true,
            message: "Registration already recorded"
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // Assign sequential serial number based on row count
    var nextSno = lastRow === 0 ? 1 : lastRow;
    rowValues[0] = nextSno;
    
    sheet.appendRow(rowValues);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      registration_id: regId,
      s_no: nextSno
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

4. Click **Deploy > New deployment**:
   - Select type: **Web app**
   - Description: `Shree Gurus Admission Webhook`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize access, and copy the **Web app URL**.
6. Set the environment variable in your hosting platform (Vercel / server):
   - `GOOGLE_SHEETS_WEBHOOK_URL`: `https://script.google.com/macros/s/.../exec`

---

## Environment Variable Names (No Secrets Exposed)

| Variable Name | Description | Default / Example |
|:---|:---|:---|
| `GOOGLE_SHEET_ID` | Destination Google Sheet ID | `1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A` |
| `GOOGLE_SHEET_TAB` | Target sheet tab name | `Sheet1` |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Full service account JSON (Option A) | `{"type":"service_account",...}` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Alternative: service account email (Option A) | `...@...iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Alternative: service account private key (Option A) | `"-----BEGIN PRIVATE KEY...-----"` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Apps Script Web App URL (Option B) | `https://script.google.com/macros/s/.../exec` |

---

## Fail-Safe Architecture & Offline Resilience

1. **Zero Data Loss**:
   - If Google Sheets API credentials are not yet configured or connection fails, enquiries are saved in `enquiries.xlsx`, `enquiries.csv`, and `enquiries.json`.
   - The unsynced record is safely stored in `sheets_retry_queue.json`.
   - The user receives a normal confirmation and callback notice without error screens.
2. **Email Notification Preservation**:
   - Every registration continues to trigger instant email notifications to `mail2shreegurus@gmail.com` via FormSubmit with full student details.
3. **Queue Re-sync Endpoint**:
   - `GET` or `POST` `/api/sync-sheets` attempts to replay all queued submissions to the Google Sheet.
   - `GET /api/sheets-status` returns real-time integration diagnostics.
