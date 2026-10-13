import os
import json
import base64
import datetime
import threading
import urllib.request
import urllib.error

# Helper to load .env.local or .env if present
def _load_env_file():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for fname in ['.env.local', '.env']:
        fpath = os.path.join(base_dir, fname)
        if os.path.exists(fpath):
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            if k not in os.environ:
                                os.environ[k] = v
            except Exception:
                pass

_load_env_file()

# Destination Google Spreadsheet ID
DEFAULT_SPREADSHEET_ID = "1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A"
SPREADSHEET_ID = os.getenv("GOOGLE_SHEET_ID", DEFAULT_SPREADSHEET_ID).strip()
SHEET_TAB_NAME = os.getenv("GOOGLE_SHEET_TAB", "Sheet1").strip()

# Target Column Headers in Row 1 (in exact required order)
REQUIRED_HEADERS = [
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
]

RETRY_QUEUE_FILE = "sheets_retry_queue.json"
SYNCED_RECORDS_FILE = "sheets_synced.json"

_lock = threading.RLock()

def _load_json_file(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def _save_json_file(filepath, data):
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[GoogleSheets] Failed to save {filepath}: {e}")

def get_service_account_credentials():
    """
    Attempts to load Google Service Account Credentials from environment variables:
    1. GOOGLE_APPLICATION_CREDENTIALS (file path)
    2. GOOGLE_SERVICE_ACCOUNT_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_JSON (raw JSON or base64)
    3. GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY
    """
    # 1. File path
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        try:
            from google.oauth2 import service_account
            return service_account.Credentials.from_service_account_file(
                cred_path,
                scopes=["https://www.googleapis.com/auth/spreadsheets"]
            )
        except Exception as e:
            print(f"[GoogleSheets] Error loading credentials from file {cred_path}: {e}")

    # 2. Raw JSON or Base64 in env
    cred_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_CREDENTIALS") or os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON") or os.getenv("GOOGLE_SERVICE_ACCOUNT_KEY")
    if cred_json:
        cred_json = cred_json.strip()
        # Check if base64 encoded
        if not cred_json.startswith('{'):
            try:
                cred_json = base64.b64decode(cred_json).decode('utf-8')
            except Exception:
                pass
        try:
            info = json.loads(cred_json)
            from google.oauth2 import service_account
            return service_account.Credentials.from_service_account_info(
                info,
                scopes=["https://www.googleapis.com/auth/spreadsheets"]
            )
        except Exception as e:
            print(f"[GoogleSheets] Error parsing service account JSON from env: {e}")

    # 3. Separate email and private key
    sa_email = os.getenv("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    sa_key = os.getenv("GOOGLE_PRIVATE_KEY")
    if sa_email and sa_key:
        try:
            clean_key = sa_key.replace('\\n', '\n')
            from google.oauth2 import service_account
            info = {
                "type": "service_account",
                "client_email": sa_email,
                "private_key": clean_key,
                "token_uri": "https://oauth2.googleapis.com/token"
            }
            return service_account.Credentials.from_service_account_info(
                info,
                scopes=["https://www.googleapis.com/auth/spreadsheets"]
            )
        except Exception as e:
            print(f"[GoogleSheets] Error initializing credentials from email/key: {e}")

    return None

def normalize_source(raw_source):
    if not raw_source:
        return "Website Form"
    s = str(raw_source).lower()
    if "chat" in s or "bot" in s or "guru ai" in s:
        return "AI Chatbot"
    return "Website Form"

def normalize_field(val):
    if val is None:
        return ""
    val_str = str(val).strip()
    if val_str.lower() in ["not provided", "none", "null", "undefined"]:
        return ""
    return val_str

def format_row_data(entry, serial_number):
    """
    Maps an incoming enquiry record to the exact 14 columns in Row 1:
    1. S.No.
    2. Registration ID
    3. Submission Date & Time
    4. Academic Year
    5. State
    6. Campus Location & District
    7. Campus Type
    8. Selected Class
    9. Selected Course / Program
    10. Student Name
    11. Email Address
    12. Phone Number
    13. Registration Source (Website Form / AI Chatbot)
    14. Registration Status
    """
    clean_phone = ''.join(c for c in str(entry.get('phone', '')) if c.isdigit())
    if len(clean_phone) > 10:
        clean_phone = clean_phone[-10:]

    email = normalize_field(entry.get('email'))
    if email and '@' not in email:
        email = ""

    return [
        serial_number,                                                     # 1. S.No.
        entry.get('enquiry_id') or entry.get('registration_id', ''),      # 2. Registration ID
        entry.get('timestamp') or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), # 3. Submission Date & Time
        normalize_field(entry.get('year') or entry.get('academic_year')), # 4. Academic Year
        normalize_field(entry.get('state')),                              # 5. State
        normalize_field(entry.get('district') or entry.get('city')),      # 6. Campus Location & District
        normalize_field(entry.get('campus_type') or entry.get('hostel')), # 7. Campus Type
        normalize_field(entry.get('class')),                              # 8. Selected Class
        normalize_field(entry.get('course')),                             # 9. Selected Course / Program
        normalize_field(entry.get('student_name') or entry.get('name')),  # 10. Student Name
        email,                                                             # 11. Email Address
        clean_phone,                                                       # 12. Phone Number
        normalize_source(entry.get('source')),                             # 13. Registration Source
        normalize_field(entry.get('status') or "Pending")                  # 14. Registration Status
    ]

def append_to_google_sheet(entry):
    """
    Thread-safe insertion into Google Sheet with deduplication and retry queue.
    """
    with _lock:
        reg_id = entry.get('enquiry_id') or entry.get('registration_id')
        if not reg_id:
            reg_id = f"SG-{datetime.datetime.now().strftime('%y%m%d%H%M%S')}"
            entry['enquiry_id'] = reg_id

        # 1. Check if already synced (prevent duplicate entries on retry)
        synced_list = _load_json_file(SYNCED_RECORDS_FILE)
        for synced in synced_list:
            if synced.get('registration_id') == reg_id:
                print(f"[GoogleSheets] Registration ID {reg_id} already synced. Skipping duplicate.")
                return {
                    "success": True,
                    "synced": True,
                    "duplicate": True,
                    "registration_id": reg_id,
                    "s_no": synced.get('s_no')
                }

        # 2. Check retry queue to prevent duplicate entries in queue
        queue = _load_json_file(RETRY_QUEUE_FILE)
        existing_in_queue = False
        for q_item in queue:
            if q_item.get('enquiry_id') == reg_id:
                existing_in_queue = True
                break

        # Calculate serial number based on synced records count + queue count + 1
        s_no = len(synced_list) + 1

        row = format_row_data(entry, s_no)

        # 3. Attempt direct sync via Service Account or Apps Script Webhook
        synced_successfully = False
        sync_error = None

        webhook_url = os.getenv("GOOGLE_SHEETS_WEBHOOK_URL")
        creds = get_service_account_credentials()

        if creds:
            try:
                from googleapiclient.discovery import build
                service = build('sheets', 'v4', credentials=creds, cache_discovery=False)
                sheets_api = service.spreadsheets()

                # Check if headers exist
                header_range = f"{SHEET_TAB_NAME}!A1:N1"
                resp = sheets_api.values().get(spreadsheetId=SPREADSHEET_ID, range=header_range).execute()
                existing_headers = resp.get('values', [])
                if not existing_headers or len(existing_headers[0]) == 0:
                    sheets_api.values().update(
                        spreadsheetId=SPREADSHEET_ID,
                        range=header_range,
                        valueInputOption='USER_ENTERED',
                        body={'values': [REQUIRED_HEADERS]}
                    ).execute()
                    print(f"[GoogleSheets] Initialized required headers in {SHEET_TAB_NAME}!A1:N1")

                # Get row count in column A to accurately assign S.No. from actual spreadsheet
                col_a_resp = sheets_api.values().get(spreadsheetId=SPREADSHEET_ID, range=f"{SHEET_TAB_NAME}!A:B").execute()
                sheet_rows = col_a_resp.get('values', [])
                
                # Check for existing Registration ID in column B on the sheet itself
                for row_idx, r in enumerate(sheet_rows):
                    if len(r) > 1 and r[1] == reg_id:
                        print(f"[GoogleSheets] Registration ID {reg_id} already exists in Sheet row {row_idx + 1}. Skipping append.")
                        synced_successfully = True
                        break

                if not synced_successfully:
                    if len(sheet_rows) <= 1:
                        s_no = 1
                    else:
                        s_no = len(sheet_rows) # Row 1 is header, so row 2 is S.No 1, etc.
                    
                    row[0] = s_no

                    append_body = {
                        'range': f"{SHEET_TAB_NAME}!A:N",
                        'majorDimension': 'ROWS',
                        'values': [row]
                    }
                    sheets_api.values().append(
                        spreadsheetId=SPREADSHEET_ID,
                        range=f"{SHEET_TAB_NAME}!A:N",
                        valueInputOption='USER_ENTERED',
                        insertDataOption='INSERT_ROWS',
                        body=append_body
                    ).execute()
                    synced_successfully = True
                    print(f"[GoogleSheets] Successfully appended row {s_no} (ID: {reg_id}) to sheet {SPREADSHEET_ID}")
            except Exception as e:
                sync_error = str(e)
                print(f"[GoogleSheets] Google API append failed: {e}")

        elif webhook_url:
            try:
                payload = {
                    's_no': s_no,
                    'registration_id': reg_id,
                    'row_values': row,
                    'data': entry
                }
                # Preferred: requests library (handles redirects and SSL certifi bundle cleanly)
                try:
                    import requests
                    resp = requests.post(webhook_url, json=payload, timeout=12)
                    if resp.status_code in [200, 201]:
                        synced_successfully = True
                        try:
                            res_json = resp.json()
                            if res_json.get('s_no'):
                                s_no = res_json['s_no']
                                row[0] = s_no
                        except Exception:
                            pass
                        print(f"[GoogleSheets] Webhook delivered row {s_no} to {webhook_url}")
                    else:
                        sync_error = f"Webhook returned status {resp.status_code}: {resp.text}"
                        print(f"[GoogleSheets] {sync_error}")
                except ImportError:
                    import ssl
                    ctx = ssl.create_default_context()
                    try:
                        ctx.check_hostname = False
                        ctx.verify_mode = ssl.CERT_NONE
                    except Exception:
                        pass
                    req = urllib.request.Request(
                        webhook_url,
                        data=json.dumps(payload).encode('utf-8'),
                        headers={'Content-Type': 'application/json'},
                        method='POST'
                    )
                    with urllib.request.urlopen(req, timeout=12, context=ctx) as resp:
                        if resp.status in [200, 201]:
                            synced_successfully = True
                            print(f"[GoogleSheets] Webhook delivered row {s_no} to {webhook_url}")
            except Exception as e:
                sync_error = str(e)
                print(f"[GoogleSheets] Webhook delivery failed: {e}")

        else:
            sync_error = "No Google Service Account credentials or Webhook URL configured in environment."

        # 4. Handle sync result
        if synced_successfully:
            synced_list.append({
                'registration_id': reg_id,
                's_no': s_no,
                'synced_at': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'row': row
            })
            _save_json_file(SYNCED_RECORDS_FILE, synced_list)
            return {
                "success": True,
                "synced": True,
                "registration_id": reg_id,
                "s_no": s_no
            }
        else:
            # Enqueue for retry if not already in queue
            if not existing_in_queue:
                queue.append({
                    'enquiry_id': reg_id,
                    's_no': s_no,
                    'queued_at': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'last_error': sync_error,
                    'entry': entry,
                    'row': row
                })
                _save_json_file(RETRY_QUEUE_FILE, queue)
                print(f"[GoogleSheets] Saved enquiry {reg_id} to retry queue ({RETRY_QUEUE_FILE}).")

            return {
                "success": True,
                "synced": False,
                "queued": True,
                "registration_id": reg_id,
                "s_no": s_no,
                "notice": "Saved to local database and retry queue.",
                "error": sync_error
            }

def sync_retry_queue():
    """
    Retries pushing all queued items to Google Sheets.
    """
    with _lock:
        queue = _load_json_file(RETRY_QUEUE_FILE)
        if not queue:
            return {"success": True, "message": "Queue is empty.", "synced_count": 0}

        creds = get_service_account_credentials()
        webhook_url = os.getenv("GOOGLE_SHEETS_WEBHOOK_URL")

        if not creds and not webhook_url:
            return {
                "success": False,
                "message": "Credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SHEETS_WEBHOOK_URL.",
                "queued_count": len(queue)
            }

        synced_count = 0
        remaining_queue = []

        for item in queue:
            entry = item.get('entry', {})
            res = append_to_google_sheet(entry)
            if res.get('synced'):
                synced_count += 1
            else:
                remaining_queue.append(item)

        _save_json_file(RETRY_QUEUE_FILE, remaining_queue)
        return {
            "success": True,
            "synced_count": synced_count,
            "remaining_in_queue": len(remaining_queue)
        }

def get_sheets_status():
    """
    Returns diagnostic status without leaking secret values.
    """
    creds_configured = get_service_account_credentials() is not None
    webhook_configured = bool(os.getenv("GOOGLE_SHEETS_WEBHOOK_URL"))
    queue = _load_json_file(RETRY_QUEUE_FILE)
    synced = _load_json_file(SYNCED_RECORDS_FILE)

    return {
        "spreadsheet_id": SPREADSHEET_ID,
        "spreadsheet_url": f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit",
        "sheet_tab": SHEET_TAB_NAME,
        "service_account_configured": creds_configured,
        "webhook_configured": webhook_configured,
        "total_synced_records": len(synced),
        "pending_retry_queue_records": len(queue),
        "required_columns": REQUIRED_HEADERS
    }
