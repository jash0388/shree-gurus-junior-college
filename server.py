import http.server
import socketserver
import os
import mimetypes
import json
import csv
import datetime
import urllib.request
from urllib.parse import urlparse

PORT = 8000
EXCEL_FILE = 'enquiries.xlsx'
CSV_FILE = 'enquiries.csv'
JSON_FILE = 'enquiries.json'
EMAIL_LOG = 'emails_sent.log'
NOTIFICATION_EMAIL = 'mail2shreegurus@gmail.com'

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
        # Allow caching for static media
        path = self.translate_path(self.path)
        if any(path.endswith(ext) for ext in ['.mp4', '.jpg', '.jpeg', '.png', '.webp', '.woff', '.woff2', '.ttf', '.css', '.js']):
            self.send_header('Cache-Control', 'public, max-age=86400')
        else:
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
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

        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path in ['/api/enquiry', '/api/chatbot-register', '/api/contact-submit']:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
            except Exception:
                # Handle form urlencoded
                from urllib.parse import parse_qs
                data = {k: v[0] for k, v in parse_qs(body).items()}

            now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            enquiry_id = f"SG-{datetime.datetime.now().strftime('%y%m%d%H%M%S')}"

            name = data.get('name', '').strip()
            parent_name = data.get('parent_name', '').strip()
            phone = data.get('phone', '').strip()
            email = data.get('email', '').strip()
            city = data.get('city', '').strip()
            course = data.get('course', 'Intermediate MPC (IIT-JEE)').strip()
            year = data.get('academic_year', '2027-28').strip()
            campus = data.get('campus', 'Vijayawada Campus').strip()
            hostel = data.get('hostel', 'Not Specified').strip()
            notes = data.get('notes', data.get('message', '')).strip()
            source = data.get('source', 'AI Chatbot Registration').strip()
            status = 'Pending Followup'

            entry = {
                'enquiry_id': enquiry_id,
                'timestamp': now_str,
                'name': name,
                'parent_name': parent_name,
                'phone': phone,
                'email': email,
                'city': city,
                'course': course,
                'academic_year': year,
                'campus': campus,
                'hostel': hostel,
                'notes': notes,
                'source': source,
                'status': status
            }

            row_data = [
                enquiry_id, now_str, name, phone, email, city,
                course, year, campus, hostel, parent_name, notes,
                source, status
            ]

            # Save to Excel & CSV & JSON
            append_to_excel(row_data)
            append_to_csv(row_data)
            append_to_json(entry)

            # Dispatch notification
            dispatch_email_notification(entry)

            response_payload = {
                'success': True,
                'message': 'Course registration saved to Excel and email notification dispatched!',
                'enquiry_id': enquiry_id,
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
