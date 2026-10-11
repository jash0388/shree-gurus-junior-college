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

        if parsed.path == '/api/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                chat_data = json.loads(body)
            except Exception:
                chat_data = {}
            query = chat_data.get('message', '').lower().strip()
            
            # Intelligent Institutional Knowledge Resolver
            if any(k in query for k in ['fee', 'cost', 'scholarship', 'concession', 'price']):
                ans = ("🎓 <strong>Fee &amp; Scholarship Policy:</strong><br><br>"
                       "Course fees depend on stream (Medical vs Engineering) and campus type (Day Scholar vs Residential).<br><br>"
                       "• <strong>Up to 100% Merit Scholarships</strong> are awarded based on Class 10 GPA and the <em>Shree Gurus Talent Search Exam (SG-SAT)</em>.<br>"
                       "• Fee schedules are finalized by our Academic Dean during counseling.<br><br>"
                       "Submit an enquiry or call <strong>+91 9640711111</strong> for official fee details.")
                chips = ["Register for 2026–27", "Tell me about Scholarships", "Speak with Admissions Desk"]
            elif any(k in query for k in ['jee', 'engineering', 'mpc', 'iit', 'trishul', 'sindoor']):
                if '2026' in query:
                    ans = ("⚠️ <strong>Note regarding 2026–2027:</strong><br>"
                           "For the 2026–2027 intake, admissions are exclusively active for <strong>NEET Medical (Brahmos)</strong>.<br><br>"
                           "Our premier Engineering programs open for <strong>2027 – 2028 (Pre-Bookings Open)</strong>:<br>"
                           "• <strong>TRISHUL:</strong> 2-Year Integrated IPE + JEE Main (120 seats, CBT lab testing)<br>"
                           "• <strong>SINDOOR:</strong> Elite 2-Year Integrated IPE + JEE Advanced (Super-30 Top 500 AIR cohort)<br><br>"
                           "Would you like to pre-book a seat for 2027–28?")
                    chips = ["Pre-Book 2027–28 JEE", "Explore Brahmos (NEET 2026)", "Contact Admissions Desk"]
                else:
                    ans = ("⚙️ <strong>Engineering Programs (M.P.C):</strong><br><br>"
                           "We offer two flagship engineering cohorts (open for 2027–2028 Intake):<br><br>"
                           "1. <strong>TRISHUL (IPE + JEE Main):</strong> Focuses on conceptual clarity, speed & accuracy with our 200+ computer CBT lab. 120 seats (40 Girls, 80 Boys).<br>"
                           "2. <strong>SINDOOR (IPE + JEE Advanced):</strong> Elite problem-solving cohort mentored by senior IITian faculty targeting All India Top 500 Ranks.<br><br>"
                           "Both programs feature small 25–30 student batches, evening study care, and Board marks integration.")
                    chips = ["Pre-Book Trishul 2027–28", "Pre-Book Sindoor 2027–28", "Ask about Hostels"]
            elif any(k in query for k in ['2026', 'year', 'intake', 'when']):
                ans = ("📅 <strong>Academic Year Admissions Status:</strong><br><br>"
                       "• <strong>2026 – 2027 Session (Active Intake):</strong> Admissions are exclusively open for <strong>NEET Medical (BRAHMOS Track — Bi.P.C)</strong> and Medical Repeaters.<br>"
                       "• <strong>2027 – 2028 Session (Pre-Bookings Open):</strong> All three programs are open — <strong>BRAHMOS (NEET)</strong>, <strong>TRISHUL (JEE Main)</strong>, and <strong>SINDOOR (JEE Advanced)</strong>.<br><br>"
                       "Which academic year are you planning for?")
                chips = ["2026–27 (NEET Only)", "2027–28 (JEE & NEET)", "Tell me about Brahmos"]
            elif any(k in query for k in ['neet', 'medical', 'bipc', 'brahmos', 'doctor']):
                ans = ("🩺 <strong>BRAHMOS — IPE + NEET Medical (Bi.P.C):</strong><br><br>"
                       "Our flagship medical program is <strong>Active for 2026–2027 Admissions</strong>!<br><br>"
                       "• <strong>Cohort Size:</strong> Strictly 120 seats total (90 Girls across 3 sections, 30 Boys in 1 section).<br>"
                       "• <strong>NCERT Microscopic Mastery:</strong> Line-by-line coverage in Biology with dedicated botany & zoology wet labs.<br>"
                       "• <strong>Physics & Chemistry Shortcuts:</strong> High-speed numerical drills and formula maps.<br>"
                       "• <strong>Daily Testing:</strong> Morning concept classes followed by evening diagnostic tests.<br>"
                       "• <strong>Facilities:</strong> Smart A/C classrooms with separate residential hostels.<br><br>"
                       "Would you like to register an admission enquiry for Brahmos 2026–27?")
                chips = ["Register for Brahmos 2026–27", "Campus & Hostel Details", "Fee & Scholarships"]
            elif any(k in query for k in ['hostel', 'food', 'mess', 'room', 'residential', 'boarding', 'girls', 'accommodation', 'campus type']):
                ans = ("🛏️ <strong>Campus Types &amp; Accommodation Options:</strong><br><br>"
                       "We offer three flexible campus options:<br><br>"
                       "1. <strong>Residential (Hostel + Food + 24/7 Mentoring):</strong> Independent secured campuses for Boys and Girls. Nutritious doctor-approved South Indian dining, AC/Air-cooled rooms with attached washrooms, 24/7 CCTV, and resident faculty study hours.<br>"
                       "2. <strong>Semi-Residential (Day + Evening Study Care):</strong> 8:00 AM to 8:00 PM program with classes, lunch, dinner/snacks, and evening doubt clearance.<br>"
                       "3. <strong>Day Scholar (Classroom + Labs):</strong> Standard daytime classroom coaching and laboratory practicals.<br><br>"
                       "Which option suits you best?")
                chips = ["Residential Hostels", "Semi-Residential (Study Care)", "Day Scholar (Day Only)"]
            elif any(k in query for k in ['contact', 'phone', 'number', 'call', 'email', 'helpline', 'whatsapp']):
                ans = ("📞 <strong>Official Admissions Helplines:</strong><br><br>"
                       "• <strong>Phone:</strong> <a href='tel:9640711111'>+91 9640711111</a> / <a href='tel:9171222333'>9171222333</a><br>"
                       "• <strong>WhatsApp:</strong> <a href='https://wa.me/919640711111' target='_blank'>+91 9640711111</a><br>"
                       "• <strong>Email:</strong> <a href='mailto:mail2shreegurus@gmail.com'>mail2shreegurus@gmail.com</a><br>"
                       "• <strong>Counseling Hours:</strong> 8:00 AM to 8:00 PM (Monday – Sunday)<br><br>"
                       "Our Academic Dean responds to admission enquiries within 2 hours!")
                chips = ["Register Admission Enquiry", "WhatsApp Chat", "Campus Location"]
            elif any(k in query for k in ['where', 'location', 'address', 'reach', 'city', 'vijayawada']):
                ans = ("📍 <strong>Campus Location:</strong><br><br>"
                       "Our primary campus and head office are located at:<br>"
                       "<strong>SHREE GURUS GROUP OF INSTITUTIONS</strong><br>"
                       "D.No: 48-19-5/9, Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada - 520007, Andhra Pradesh.<br><br>"
                       "• We operate separate secured campuses for <strong>Boys</strong> and <strong>Girls</strong> in Vijayawada.<br>"
                       "• Counseling desk is open <strong>8:00 AM – 8:00 PM</strong> daily.")
                chips = ["Schedule Campus Visit", "Hostel & Dining Details", "Contact Helplines"]
            elif any(k in query for k in ['result', 'rank', 'topper', 'pass', 'track record']):
                ans = ("🏆 <strong>Recent Academic Benchmarks:</strong><br><br>"
                       "• <strong>100% Pass Percentage</strong> in Intermediate 1st Year Board examinations.<br>"
                       "• <strong>MPC Stream Topper:</strong> 465 / 470 Marks.<br>"
                       "• <strong>BiPC Stream Topper:</strong> 450 / 470 Marks.<br>"
                       "• <strong>35+ Students:</strong> Scored 460+ marks in Mathematics and Natural Sciences.<br><br>"
                       "Our targeted 3-tier pedagogy guarantees both state board perfection and competitive edge.")
                chips = ["Explore Brahmos (NEET)", "Explore Trishul (JEE)", "Register for 2026-27"]
            elif any(k in query for k in ['batch size', 'strength', 'ratio', 'how many student', 'crowd']):
                ans = ("👥 <strong>Small Batch Ceiling (Super-30 Cohorts):</strong><br><br>"
                       "Unlike mass coaching institutions that pack 100 to 150 students into a single lecture hall, Shree Gurus enforces a strict ceiling of <strong>25 to 30 students per classroom</strong>.<br><br>"
                       "This ensures that every teacher knows every student by name, tracks their daily Error Log, and provides 1-on-1 mentorship after class.")
                chips = ["Explore Programs", "Admission Process", "Register Now"]
            else:
                ans = ("Namaste! 🙏 I am <strong>Guru AI</strong>, official admissions counsellor for <strong>Shree Gurus Group of Institutions</strong>, Vijayawada.<br><br>"
                       "I can provide verified information on:<br>"
                       "• <strong>2026–2027 Admissions:</strong> Active for NEET Medical (BRAHMOS Bi.P.C)<br>"
                       "• <strong>2027–2028 Admissions:</strong> TRISHUL (JEE Main), SINDOOR (JEE Advanced) &amp; BRAHMOS<br>"
                       "• <strong>Campus Options:</strong> Residential Boys &amp; Girls Hostels, Semi-Residential, Day Scholar<br>"
                       "• <strong>Location:</strong> Ballem Vari Street, Near Ramavarappadu Ring, Vijayawada<br>"
                       "• <strong>Scholarships:</strong> Up to 100% based on Class 10 GPA &amp; SG-SAT<br><br>"
                       "What would you like to know, or would you like to submit an admission enquiry?")
                chips = ["Admissions 2026–27", "Campus & Hostels", "Fee & Scholarships", "Register Enquiry"]

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
            enquiry_id = f"SG-{datetime.datetime.now().strftime('%y%m%d%H%M%S')}"

            name = (data.get('student_name') or data.get('name') or '').strip()
            parent_name = data.get('parent_name', '').strip()
            phone = data.get('phone', '').strip()
            email = data.get('email', '').strip()
            city = (data.get('district') or data.get('city') or 'Vijayawada (NTR Dist)').strip()
            course = data.get('course', 'BRAHMOS: IPE + NEET Medical (Bi.P.C)').strip()
            year = (data.get('year') or data.get('academic_year') or '2026 - 2027 (Active Intake)').strip()
            campus = (data.get('campus_type') or data.get('campus') or 'Vijayawada Campus').strip()
            hostel = data.get('hostel', 'Residential (Hostel + Food + 24/7 Mentoring)').strip()
            notes = (data.get('notes') or data.get('message') or 'Admissions Enquiry').strip()
            source = data.get('source', 'Guru AI Admissions Chatbot').strip()
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
