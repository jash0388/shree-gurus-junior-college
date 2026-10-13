import http.server
import socketserver
import os
import mimetypes
import json
import csv
import datetime
import urllib.request
from urllib.parse import urlparse
import google_sheets

PORT = 8000
EXCEL_FILE = 'enquiries.xlsx'
CSV_FILE = 'enquiries.csv'
JSON_FILE = 'enquiries.json'
EMAIL_LOG = 'emails_sent.log'
NOTIFICATION_EMAIL = 'mail2shreegurus@gmail.com'

mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('image/x-icon', '.ico')

# Ensure openpyxl is ready
try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False

def init_excel():
    if not OPENPYXL_AVAILABLE:
        return
    if not os.path.exists(EXCEL_FILE):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = 'Admissions Enquiries'
        headers = [
            'Enquiry ID', 'Date & Time', 'Student / Parent Name', 
            'Phone / WhatsApp', 'Email ID', 'City / Location', 
            'Course / Stream', 'Academic Year', 'Campus Preference', 
            'Hostel Required', 'Parent / Guardian', 'Remarks / Message', 
            'Source', 'Status'
        ]
        ws.append(headers)

        header_fill = PatternFill(start_color='081845', end_color='081845', fill_type='solid')
        header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
        thin_border = Border(
            left=Side(style='thin', color='CBD5E1'),
            right=Side(style='thin', color='CBD5E1'),
            top=Side(style='thin', color='CBD5E1'),
            bottom=Side(style='thin', color='CBD5E1')
        )

        for col_idx in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
            cell.border = thin_border
            ws.column_dimensions[get_column_letter(col_idx)].width = 22

        ws.row_dimensions[1].height = 28
        wb.save(EXCEL_FILE)

def init_csv():
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow([
                'Enquiry ID', 'Date & Time', 'Student / Parent Name', 
                'Phone / WhatsApp', 'Email ID', 'City / Location', 
                'Course / Stream', 'Academic Year', 'Campus Preference', 
                'Hostel Required', 'Parent / Guardian', 'Remarks / Message', 
                'Source', 'Status'
            ])

def append_to_excel(row_data):
    init_excel()
    if not OPENPYXL_AVAILABLE:
        return
    try:
        wb = openpyxl.load_workbook(EXCEL_FILE)
        ws = wb.active
        ws.append(row_data)
        
        row_idx = ws.max_row
        row_fill = PatternFill(start_color='F8FAFD' if row_idx % 2 == 0 else 'FFFFFF', fill_type='solid')
        cell_font = Font(name='Calibri', size=10)
        thin_border = Border(
            left=Side(style='thin', color='E2E8F0'),
            right=Side(style='thin', color='E2E8F0'),
            top=Side(style='thin', color='E2E8F0'),
            bottom=Side(style='thin', color='E2E8F0')
        )
        
        for col_idx in range(1, len(row_data) + 1):
            cell = ws.cell(row=row_idx, column=col_idx)
            cell.fill = row_fill
            cell.font = cell_font
            cell.border = thin_border
            if col_idx in [1, 2, 4, 8, 10, 14]:
                cell.alignment = Alignment(horizontal='center', vertical='center')
            else:
                cell.alignment = Alignment(horizontal='left', vertical='center')

        # Auto adjust column width
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 14)

        ws.row_dimensions[row_idx].height = 22
        wb.save(EXCEL_FILE)
    except Exception as e:
        print(f"Error saving to Excel: {e}")

def append_to_csv(row_data):
    init_csv()
    try:
        with open(CSV_FILE, 'a', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)
            writer.writerow(row_data)
    except Exception as e:
        print(f"Error saving to CSV: {e}")

def append_to_json(entry):
    entries = []
    if os.path.exists(JSON_FILE):
        try:
            with open(JSON_FILE, 'r', encoding='utf-8') as f:
                entries = json.load(f)
        except Exception:
            entries = []
    entries.append(entry)
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(entries, f, indent=2)

def dispatch_email_notification(entry):
    timestamp = entry.get('timestamp', '')
    name = entry.get('name', 'Prospective Student')
    phone = entry.get('phone', 'N/A')
    email = entry.get('email', 'N/A')
    course = entry.get('course', 'Intermediate')
    city = entry.get('city', 'N/A')
    year = entry.get('academic_year', '2027-28')
    campus = entry.get('campus', 'Vijayawada Campus')
    hostel = entry.get('hostel', 'N/A')
    source = entry.get('source', 'Website Form')
    notes = entry.get('notes', 'None')
    enquiry_id = entry.get('enquiry_id', '')

    log_entry = f"""
========================================================================
[EMAIL DISPATCH] New Admission Enquiry Received
Date & Time  : {timestamp}
Enquiry ID   : {enquiry_id}
Target Email : {NOTIFICATION_EMAIL}
------------------------------------------------------------------------
Student Name : {name}
Phone No     : {phone}
Email        : {email}
City/Town    : {city}
Target Course: {course}
Academic Year: {year}
Campus Pref  : {campus}
Hostel Req   : {hostel}
Source       : {source}
Remarks/Note : {notes}
========================================================================
"""
    print(log_entry)
    with open(EMAIL_LOG, 'a', encoding='utf-8') as f:
        f.write(log_entry + '\n')

    # Asynchronously dispatch to FormSubmit so real email delivers to mail2shreegurus@gmail.com
    try:
        req_data = json.dumps({
            '_subject': f"New Shree Gurus Admission Enquiry - {name} ({course})",
            '_replyto': email if '@' in email else NOTIFICATION_EMAIL,
            'Enquiry ID': enquiry_id,
            'Student Name': name,
            'Phone / WhatsApp': phone,
            'Email Address': email,
            'Course': course,
            'Academic Year': year,
            'Campus Preference': campus,
            'Hostel Required': hostel,
            'City / Location': city,
            'Source': source,
            'Notes / Remarks': notes,
            'Date & Time': timestamp
        }).encode('utf-8')
        
        req = urllib.request.Request(
            f"https://formsubmit.co/ajax/{NOTIFICATION_EMAIL}",
            data=req_data,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'ShreeGurusAdmissionsServer/1.0'
            }
        )
        # Timeout 3s non-blocking
        with urllib.request.urlopen(req, timeout=3) as resp:
            print(f"FormSubmit email status: {resp.status}")
    except Exception as e:
        print(f"Email dispatch notification attempt: {e} (logged to {EMAIL_LOG})")
class FastHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Never cache HTML, CSS, JS, icons or static assets during development
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # Download Excel endpoint
        if parsed.path == '/api/download-excel':
            init_excel()
            if os.path.exists(EXCEL_FILE):
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                self.send_header('Content-Disposition', 'attachment; filename="Shree_Gurus_Admissions_Enquiries.xlsx"')
                self.send_header('Content-Length', str(os.path.getsize(EXCEL_FILE)))
                self.end_headers()
                with open(EXCEL_FILE, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "Excel file not found yet")
                return

        # Download CSV endpoint
        if parsed.path == '/api/download-csv':
            init_csv()
            if os.path.exists(CSV_FILE):
                self.send_response(200)
                self.send_header('Content-Type', 'text/csv; charset=utf-8')
                self.send_header('Content-Disposition', 'attachment; filename="Shree_Gurus_Admissions_Enquiries.csv"')
                self.send_header('Content-Length', str(os.path.getsize(CSV_FILE)))
                self.end_headers()
                with open(CSV_FILE, 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "CSV file not found yet")
                return

        # View Enquiries as JSON
        if parsed.path == '/api/enquiries':
            entries = []
            if os.path.exists(JSON_FILE):
                try:
                    with open(JSON_FILE, 'r', encoding='utf-8') as f:
                        entries = json.load(f)
                except Exception:
                    entries = []
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(entries, indent=2).encode('utf-8'))
            return

        # View Google Sheets Sync & Credentials Status
        if parsed.path == '/api/sheets-status':
            status = google_sheets.get_sheets_status()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(status, indent=2).encode('utf-8'))
            return

        # Trigger Sync for Retry Queue via GET
        if parsed.path == '/api/sync-sheets':
            sync_res = google_sheets.sync_retry_queue()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(sync_res, indent=2).encode('utf-8'))
            return

        super().do_GET()
        return

    def do_POST(self):
        parsed = urlparse(self.path)

        # Trigger Sync for Retry Queue via POST
        if parsed.path == '/api/sync-sheets':
            sync_res = google_sheets.sync_retry_queue()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(sync_res, indent=2).encode('utf-8'))
            return

        if parsed.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                chat_data = json.loads(body)
            except Exception:
                chat_data = {}
            query = chat_data.get('message', '').lower().strip()
            
            # Intelligent Institutional Knowledge Resolver
            clean_query = ''.join(c for c in query if c.isalnum() or c.isspace()).strip()
            greeting_words = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'hlo', 'good morning', 'good afternoon', 'good evening', 'gm', 'yo', 'start', 'bro']
            if any(clean_query == w or clean_query.startswith(w + ' ') or clean_query.endswith(' ' + w) or w in clean_query.split() for w in greeting_words):
                ans = "Hello! 🙏 Welcome to <strong>Shree Gurus</strong>. How can I help you today?"
                chips = ["2026–27 NEET Admissions", "Register Enquiry", "Campus & Hostels", "Fee Structure"]
            elif any(k in query for k in ['fee', 'cost', 'scholarship', 'concession', 'price']):
                ans = "🎓 Course fees depend on stream and hostel accommodation. We award up to <strong>100% Merit Scholarships</strong> based on Class 10 GPA and SG-SAT. Would you like a fee quotation for your profile?"
                chips = ["Register for 2026–27", "Scholarship Details", "Call +91 9640711111"]
            elif any(k in query for k in ['jee', 'engineering', 'mpc', 'iit', 'trishul', 'sindoor']):
                if '2026' in query:
                    ans = "⚠️ For 2026–27, admissions are active only for <strong>NEET Medical (Brahmos)</strong>. Our Engineering tracks (Trishul &amp; Sindoor) open for <strong>2027–28 Intake</strong>. Would you like to pre-book?"
                    chips = ["Pre-Book 2027–28 JEE", "Explore Brahmos NEET 2026", "Helpline +91 9640711111"]
                else:
                    ans = "⚙️ We offer <strong>TRISHUL</strong> (JEE Main) and <strong>SINDOOR</strong> (JEE Advanced) for 2027–28 with 25–30 student cohorts, CBT computer labs, and senior IITian mentorship."
                    chips = ["Pre-Book Trishul 2027–28", "Pre-Book Sindoor 2027–28", "Ask about Hostels"]
            elif any(k in query for k in ['2026', 'year', 'intake', 'when']):
                ans = "📅 <strong>Admissions Status:</strong><br>• <strong>2026–27 (Active):</strong> NEET Medical (BRAHMOS Bi.P.C) &amp; Repeaters.<br>• <strong>2027–28 (Pre-Bookings):</strong> Open for Brahmos, Trishul &amp; Sindoor."
                chips = ["2026–27 NEET Admissions", "2027–28 JEE & NEET", "Register Enquiry"]
            elif any(k in query for k in ['neet', 'medical', 'bipc', 'brahmos', 'doctor']):
                ans = "🩺 <strong>BRAHMOS (IPE + NEET Medical Bi.P.C):</strong> Active for 2026–27 with 120 seats, line-by-line NCERT Biology mastery, and daily diagnostic testing. Would you like to register an enquiry?"
                chips = ["Register for Brahmos", "Campus & Hostels", "Fee Structure"]
            elif any(k in query for k in ['repeat', 'long term', 'dropper', '12th pass']):
                ans = "🎯 Our <strong>Long-Term Repeaters</strong> batch offers intensive 1-year coaching for NEET &amp; JEE 2027 with daily CBT tests, personalized error tracking, and evening doubt clearance."
                chips = ["Register for Repeaters", "Hostel Facilities", "Call +91 9640711111"]
            elif any(k in query for k in ['where', 'location', 'address', 'reach', 'city', 'vijayawada']):
                ans = "📍 <strong>Campus Location:</strong> D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007. We operate separate secured campuses for Boys and Girls."
                chips = ["Hostel Details", "Schedule Visit", "Register Enquiry"]
            elif any(k in query for k in ['hostel', 'food', 'mess', 'room', 'residential', 'boarding', 'girls', 'accommodation', 'campus type']):
                ans = "🛏️ We offer Residential (separate AC hostels for Boys &amp; Girls with doctor-approved South Indian dining and 24/7 mentoring), Semi-Residential (8 AM – 8 PM study care), and Day Scholar options."
                chips = ["Residential Hostels", "Day Scholar Options", "Fee Details"]
            elif any(k in query for k in ['contact', 'phone', 'number', 'call', 'email', 'helpline', 'whatsapp']):
                ans = "📞 Admissions Helpline: <a href='tel:9640711111'><strong>+91 96407 11111</strong></a> / <a href='tel:9171222333'><strong>+91 91712 22333</strong></a> (8 AM – 8 PM daily). Email: <a href='mailto:mail2shreegurus@gmail.com'><strong>mail2shreegurus@gmail.com</strong></a>."
                chips = ["Register Enquiry", "WhatsApp Chat", "Campus Location"]
            elif any(k in query for k in ['batch size', 'strength', 'ratio', 'how many student', 'crowd']):
                ans = "👥 We strictly limit classes to <strong>25 to 30 students per batch</strong> (Super-30 cohorts) so faculty know every student personally and track their daily error log."
                chips = ["Explore Programs", "Admission Process", "Register Now"]
            elif any(k in query for k in ['result', 'rank', 'topper', 'pass', 'track record']):
                ans = "🏆 <strong>100% Pass Rate</strong> in Inter 1st Year. Top scores: MPC 465/470, BiPC 450/470, with 35+ students scoring 460+ marks."
                chips = ["Brahmos (NEET)", "Trishul (JEE)", "Register for 2026-27"]
            elif any(k in query for k in ['apply', 'procedure', 'enroll', 'process']):
                ans = "📝 Submit your details right here with Guru AI or call <a href='tel:9640711111'><strong>+91 96407 11111</strong></a>. Our Academic Dean will connect with you within 2 hours!"
                chips = ["Register Now with Guru AI", "Call +91 9640711111", "View Programs"]
            else:
                ans = "<strong>Shree Gurus Group of Institutions</strong>, Vijayawada provides premier competitive coaching for NEET &amp; JEE. Admissions are currently active for 2026–27 NEET Medical (Brahmos). How can I help you today?"
                chips = ["2026–27 NEET Admissions", "Campus & Hostels", "Fee Structure", "Register Enquiry"]

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'answer': ans, 'chips': chips}).encode('utf-8'))
            return

        if parsed.path in ['/api/enquiry', '/api/chatbot-register', '/api/contact-submit']:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
            except Exception:
                from urllib.parse import parse_qs
                data = {k: v[0] for k, v in parse_qs(body).items()}

            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            enquiry_id = (data.get('enquiry_id') or data.get('registration_id') or '').strip()
            if not enquiry_id:
                enquiry_id = f"SG-{datetime.datetime.now().strftime('%y%m%d%H%M%S')}"

            name = (data.get('student_name') or data.get('name') or '').strip()
            parent_name = data.get('parent_name', '').strip()
            phone = (data.get('phone') or '').strip()
            clean_phone = ''.join(c for c in phone if c.isdigit())
            email = (data.get('email') or '').strip()
            if email.lower() in ['not provided', 'none', 'null', 'undefined'] or '@' not in email:
                email = ''

            # Backend Validation
            if not name or len(name) < 2:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'Valid student name is required'}).encode('utf-8'))
                return

            if len(clean_phone) < 10:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'success': False, 'error': 'Valid 10-digit phone number is required'}).encode('utf-8'))
                return

            phone_10 = clean_phone[-10:]
            state = (data.get('state') or 'Andhra Pradesh').strip()
            district = (data.get('district') or data.get('city') or 'Vijayawada (NTR Dist)').strip()
            course = (data.get('course') or 'BRAHMOS: IPE + NEET Medical (Bi.P.C)').strip()
            year = (data.get('year') or data.get('academic_year') or '2026 - 2027 (Active Intake)').strip()
            campus = (data.get('campus_type') or data.get('campus') or 'Residential (A/C Class + Non-A/C Hostel + Food)').strip()
            student_class = (data.get('class') or '').strip()
            hostel = (data.get('hostel') or ('Yes' if 'residential' in campus.lower() else 'No')).strip()
            notes = (data.get('notes') or data.get('message') or 'Admissions Enquiry').strip()
            source = google_sheets.normalize_source(data.get('source'))
            status = 'Pending'

            # Idempotency / Duplicate Check
            existing_entries = []
            if os.path.exists(JSON_FILE):
                try:
                    with open(JSON_FILE, 'r', encoding='utf-8') as f:
                        existing_entries = json.load(f)
                except Exception:
                    existing_entries = []

            is_duplicate = False
            for prev in existing_entries:
                if prev.get('enquiry_id') == enquiry_id:
                    is_duplicate = True
                    break

            entry = {
                'enquiry_id': enquiry_id,
                'registration_id': enquiry_id,
                'timestamp': now_str,
                'name': name,
                'student_name': name,
                'parent_name': parent_name,
                'phone': phone_10,
                'email': email,
                'state': state,
                'district': district,
                'city': district,
                'course': course,
                'academic_year': year,
                'year': year,
                'campus': campus,
                'campus_type': campus,
                'class': student_class,
                'hostel': hostel,
                'notes': notes,
                'source': source,
                'status': status
            }

            if not is_duplicate:
                row_data = [
                    enquiry_id, now_str, name, phone_10, email, district,
                    course, year, campus, hostel, parent_name, notes,
                    source, status
                ]

                # Save to Excel & CSV & JSON
                append_to_excel(row_data)
                append_to_csv(row_data)
                append_to_json(entry)

                # Dispatch notification email (unchanged)
                dispatch_email_notification(entry)

            # Sync with Google Sheet
            sheet_res = google_sheets.append_to_google_sheet(entry)

            response_payload = {
                'success': True,
                'message': 'Course registration processed successfully.',
                'enquiry_id': enquiry_id,
                'registration_id': enquiry_id,
                's_no': sheet_res.get('s_no'),
                'google_sheet_synced': sheet_res.get('synced', False),
                'queued_for_retry': sheet_res.get('queued', False),
                'duplicate': is_duplicate or sheet_res.get('duplicate', False),
                'excel_download_url': '/api/download-excel',
                'csv_download_url': '/api/download-csv',
                'data': entry
            }

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            return

        self.send_error(404, "Endpoint not found")

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    init_excel()
    init_csv()
    server = ThreadedHTTPServer(('', PORT), FastHTTPRequestHandler)
    print(f'Serving ultra-fast multi-threaded HTTP with Admissions Excel & Email Engine on port {PORT}...')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
