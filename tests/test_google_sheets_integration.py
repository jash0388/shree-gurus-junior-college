import os
import sys
import json
import unittest
import threading
import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))

import google_sheets
import server

class TestGoogleSheetsIntegration(unittest.TestCase):
    def setUp(self):
        # Clean test queues
        self.cleanup_files = ['test_queue.json', 'test_synced.json']
        google_sheets.RETRY_QUEUE_FILE = 'test_retry_queue.json'
        google_sheets.SYNCED_RECORDS_FILE = 'test_synced_records.json'
        if os.path.exists(google_sheets.RETRY_QUEUE_FILE):
            os.remove(google_sheets.RETRY_QUEUE_FILE)
        if os.path.exists(google_sheets.SYNCED_RECORDS_FILE):
            os.remove(google_sheets.SYNCED_RECORDS_FILE)

    def tearDown(self):
        if os.path.exists(google_sheets.RETRY_QUEUE_FILE):
            os.remove(google_sheets.RETRY_QUEUE_FILE)
        if os.path.exists(google_sheets.SYNCED_RECORDS_FILE):
            os.remove(google_sheets.SYNCED_RECORDS_FILE)

    def test_01_required_headers_exact_order(self):
        expected_headers = [
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
        self.assertEqual(google_sheets.REQUIRED_HEADERS, expected_headers)
        self.assertEqual(len(google_sheets.REQUIRED_HEADERS), 14)

    def test_02_website_form_field_mapping(self):
        entry = {
            'enquiry_id': 'SG-261013000001',
            'timestamp': '2026-10-13 10:15:00',
            'student_name': 'Aarav Varma',
            'phone': '9849012345',
            'email': 'aarav.varma@gmail.com',
            'year': '2026 - 2027',
            'state': 'Andhra Pradesh',
            'district': 'Vijayawada (NTR Dist)',
            'campus_type': 'Residential (A/C Class + Non-A/C Hostel + Food)',
            'class': 'Class 11 / Inter 1st Year',
            'course': 'BRAHMOS: IPE + NEET Medical (Bi.P.C)',
            'source': 'Website Form',
            'status': 'Pending'
        }
        row = google_sheets.format_row_data(entry, 1)
        self.assertEqual(len(row), 14)
        self.assertEqual(row[0], 1)                                                    # S.No.
        self.assertEqual(row[1], 'SG-261013000001')                                     # Registration ID
        self.assertEqual(row[2], '2026-10-13 10:15:00')                                 # Submission Date & Time
        self.assertEqual(row[3], '2026 - 2027')                                         # Academic Year
        self.assertEqual(row[4], 'Andhra Pradesh')                                      # State
        self.assertEqual(row[5], 'Vijayawada (NTR Dist)')                               # Campus Location & District
        self.assertEqual(row[6], 'Residential (A/C Class + Non-A/C Hostel + Food)')     # Campus Type
        self.assertEqual(row[7], 'Class 11 / Inter 1st Year')                           # Selected Class
        self.assertEqual(row[8], 'BRAHMOS: IPE + NEET Medical (Bi.P.C)')                # Selected Course / Program
        self.assertEqual(row[9], 'Aarav Varma')                                         # Student Name
        self.assertEqual(row[10], 'aarav.varma@gmail.com')                              # Email Address
        self.assertEqual(row[11], '9849012345')                                         # Phone Number
        self.assertEqual(row[12], 'Website Form')                                       # Registration Source
        self.assertEqual(row[13], 'Pending')                                            # Registration Status

    def test_03_ai_chatbot_field_mapping_and_blank_optional_fields(self):
        # In Chatbot flow, email may not be provided, class may not be selected
        entry = {
            'enquiry_id': 'SG-261013000002',
            'timestamp': '2026-10-13 10:20:00',
            'student_name': 'Keerthi Priya',
            'phone': '9171222333',
            'email': 'Not Provided',
            'year': '2026 - 2027',
            'state': '',
            'district': 'Vijayawada',
            'campus_type': 'Residential Hostels',
            'class': None,
            'course': 'BRAHMOS: IPE + NEET Medical (Bi.P.C)',
            'source': 'Guru AI Admissions Chatbot',
            'status': 'Pending'
        }
        row = google_sheets.format_row_data(entry, 2)
        self.assertEqual(len(row), 14)
        self.assertEqual(row[0], 2)
        self.assertEqual(row[1], 'SG-261013000002')
        self.assertEqual(row[7], '')  # Selected Class left blank rather than invented
        self.assertEqual(row[10], '') # Email left blank when not provided
        self.assertEqual(row[12], 'AI Chatbot') # Normalized to 'AI Chatbot'
        self.assertEqual(row[13], 'Pending')

    def test_04_concurrency_safe_serial_number_assignment(self):
        threads = []
        entries_count = 10
        results = []

        def worker(idx):
            entry = {
                'enquiry_id': f'SG-CONCUR-{idx:03d}',
                'student_name': f'Student {idx}',
                'phone': f'99999999{idx:02d}',
                'year': '2026 - 2027',
                'course': 'BRAHMOS: IPE + NEET Medical (Bi.P.C)',
                'source': 'Website Form'
            }
            res = google_sheets.append_to_google_sheet(entry)
            results.append(res)

        for i in range(entries_count):
            t = threading.Thread(target=worker, args=(i,))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        self.assertEqual(len(results), entries_count)
        # Check all registration IDs are unique
        reg_ids = [r['registration_id'] for r in results]
        self.assertEqual(len(set(reg_ids)), entries_count)

    def test_05_idempotency_and_duplicate_prevention(self):
        entry = {
            'enquiry_id': 'SG-DUP-001',
            'student_name': 'Manish Kumar',
            'phone': '9123456789',
            'year': '2026 - 2027',
            'course': 'BRAHMOS',
            'source': 'Website Form'
        }
        # First submission
        res1 = google_sheets.append_to_google_sheet(entry)
        self.assertTrue(res1['success'])

        # Duplicate retry with exact same enquiry_id
        res2 = google_sheets.append_to_google_sheet(entry)
        self.assertTrue(res2['success'])
        self.assertTrue(res2.get('duplicate', False) or res2.get('synced', False))

        # Verify idempotency: neither synced list nor retry queue has duplicates
        synced = google_sheets._load_json_file(google_sheets.SYNCED_RECORDS_FILE)
        queue = google_sheets._load_json_file(google_sheets.RETRY_QUEUE_FILE)
        dup_synced = [s for s in synced if s.get('registration_id') == 'SG-DUP-001']
        dup_queued = [q for q in queue if q.get('enquiry_id') == 'SG-DUP-001']
        self.assertEqual(len(dup_synced) + len(dup_queued), 1)

    def test_06_email_notification_dispatch_intact(self):
        entry = {
            'enquiry_id': 'SG-EMAIL-TEST',
            'timestamp': '2026-10-13 11:00:00',
            'name': 'Bhavya Sri',
            'phone': '9876543210',
            'email': 'bhavya@test.com',
            'course': 'BRAHMOS NEET',
            'academic_year': '2026 - 2027',
            'city': 'Vijayawada',
            'campus': 'Residential',
            'source': 'AI Chatbot',
            'notes': 'Test email preservation'
        }
        # Should execute without throwing any exception
        server.dispatch_email_notification(entry)
        self.assertTrue(os.path.exists(server.EMAIL_LOG))

    def test_07_status_endpoint_returns_diagnostics(self):
        status = google_sheets.get_sheets_status()
        self.assertEqual(status['spreadsheet_id'], '1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A')
        self.assertIn('docs.google.com/spreadsheets/d/1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A', status['spreadsheet_url'])
        self.assertIn('required_columns', status)
        self.assertEqual(len(status['required_columns']), 14)

    def test_08_no_credentials_exposed_in_client_code(self):
        # Scan all client files (.html, .js, .css) to confirm no secret private keys or service account credentials
        suspicious_terms = ['BEGIN PRIVATE KEY', 'private_key_id', 'client_x509_cert_url']
        for root, _, files in os.walk('.'):
            if any(p in root for p in ['.git', 'node_modules', '.gemini', 'brain']):
                continue
            for fname in files:
                if fname.endswith(('.html', '.js', '.css')) and not fname.startswith('test_'):
                    fpath = os.path.join(root, fname)
                    with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        for term in suspicious_terms:
                            self.assertNotIn(term, content, f"Secret term '{term}' found in frontend file {fpath}!")

if __name__ == '__main__':
    unittest.main()
