/**
 * Vercel Serverless Function: /api/enquiry
 * Handles Admission Enquiries and Chatbot Registrations for Shree Gurus Group of Institutions.
 * Integrates with Google Spreadsheet: 1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A
 */

import crypto from 'crypto';

const NOTIFICATION_EMAIL = 'mail2shreegurus@gmail.com';
const DEFAULT_SPREADSHEET_ID = '1xbImFs_XR-oTXotXXsECbqiN85vq1j1fcuXjd8Xcq-A';
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || DEFAULT_SPREADSHEET_ID;
const SHEET_TAB_NAME = process.env.GOOGLE_SHEET_TAB || 'Sheet1';

const REQUIRED_HEADERS = [
    'S.No.',
    'Registration ID',
    'Submission Date & Time',
    'Academic Year',
    'State',
    'Campus Location & District',
    'Campus Type',
    'Selected Class',
    'Selected Course / Program',
    'Student Name',
    'Email Address',
    'Phone Number',
    'Registration Source (Website Form / AI Chatbot)',
    'Registration Status'
];

/**
 * Normalizes registration source to either 'Website Form' or 'AI Chatbot'
 */
function normalizeSource(rawSource) {
    if (!rawSource) return 'Website Form';
    const s = String(rawSource).toLowerCase();
    if (s.includes('chat') || s.includes('bot') || s.includes('guru ai')) {
        return 'AI Chatbot';
    }
    return 'Website Form';
}

function normalizeField(val) {
    if (val === null || val === undefined) return '';
    const s = String(val).trim();
    if (['not provided', 'none', 'null', 'undefined'].includes(s.toLowerCase())) {
        return '';
    }
    return s;
}

/**
 * Creates Google OAuth2 Service Account access token using built-in crypto.
 */
async function getGoogleAccessToken(clientEmail, privateKey) {
    const cleanKey = privateKey.replace(/\\n/g, '\n');
    const now = Math.floor(Date.now() / 1000);
    
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const claim = Buffer.from(JSON.stringify({
        iss: clientEmail,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    })).toString('base64url');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${claim}`);
    const signature = sign.sign(cleanKey, 'base64url');
    const jwt = `${header}.${claim}.${signature}`;

    const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        })
    });

    if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`OAuth token exchange failed: ${resp.status} - ${errText}`);
    }

    const tokenData = await resp.json();
    return tokenData.access_token;
}

/**
 * Synchronizes row with Google Sheet
 */
async function syncToGoogleSheets(row, enquiryId) {
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    
    // Check service account credentials
    let clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (rawJson) {
        try {
            let parsed = rawJson.trim();
            if (!parsed.startsWith('{')) {
                parsed = Buffer.from(parsed, 'base64').toString('utf-8');
            }
            const info = JSON.parse(parsed);
            clientEmail = info.client_email;
            privateKey = info.private_key;
        } catch (e) {
            console.error('[GoogleSheets] Failed to parse service account JSON:', e.message);
        }
    }

    // Strategy 1: Google Service Account API v4
    if (clientEmail && privateKey) {
        try {
            const accessToken = await getGoogleAccessToken(clientEmail, privateKey);
            
            // Check headers in Sheet1!A1:N1
            const headCheckUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_TAB_NAME}!A1:N1`;
            const headResp = await fetch(headCheckUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            
            if (headResp.ok) {
                const headData = await headResp.json();
                if (!headData.values || headData.values.length === 0) {
                    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_TAB_NAME}!A1:N1?valueInputOption=USER_ENTERED`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ values: [REQUIRED_HEADERS] })
                    });
                }
            }

            // Check row count & duplicate Registration ID in columns A:B
            const colCheckUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_TAB_NAME}!A:B`;
            const colResp = await fetch(colCheckUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            let nextSno = 1;
            if (colResp.ok) {
                const colData = await colResp.json();
                const rows = colData.values || [];
                
                // Idempotency check: if Registration ID already exists, do not duplicate
                for (let r of rows) {
                    if (r.length > 1 && r[1] === enquiryId) {
                        console.log(`[GoogleSheets] Registration ID ${enquiryId} already exists in Sheet. Skipping append.`);
                        return { synced: true, duplicate: true, s_no: r[0] };
                    }
                }

                if (rows.length > 1) {
                    nextSno = rows.length; // Row 1 is header
                }
            }

            row[0] = nextSno;

            // Append row
            const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_TAB_NAME}!A:N:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
            const appendResp = await fetch(appendUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    range: `${SHEET_TAB_NAME}!A:N`,
                    majorDimension: 'ROWS',
                    values: [row]
                })
            });

            if (appendResp.ok) {
                console.log(`[GoogleSheets] Appended row ${nextSno} (${enquiryId}) to Sheet.`);
                return { synced: true, s_no: nextSno };
            } else {
                const errBody = await appendResp.text();
                console.error(`[GoogleSheets] API append error: ${appendResp.status} - ${errBody}`);
                return { synced: false, error: errBody };
            }
        } catch (apiErr) {
            console.error('[GoogleSheets] Google API error:', apiErr.message);
            return { synced: false, error: apiErr.message };
        }
    }

    // Strategy 2: Google Apps Script Webhook
    if (webhookUrl) {
        try {
            const hookResp = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    registration_id: enquiryId,
                    row_values: row
                })
            });
            if (hookResp.ok) {
                return { synced: true };
            }
        } catch (hookErr) {
            console.error('[GoogleSheets] Webhook error:', hookErr.message);
            return { synced: false, error: hookErr.message };
        }
    }

    return { synced: false, error: 'Credentials not configured in environment.' };
}

export default async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        let data = req.body;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                data = {};
            }
        }

        const now = new Date();
        const dateStr = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        
        const enquiryId = (data.enquiry_id || data.registration_id || '').trim() ||
            `SG-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

        const name = (data.student_name || data.name || '').trim();
        const phone = (data.phone || '').trim();
        let email = (data.email || '').trim();
        if (['not provided', 'none', 'null', 'undefined'].includes(email.toLowerCase()) || !email.includes('@')) {
            email = '';
        }

        const year = (data.year || data.academic_year || '2026 - 2027 (Active Intake)').trim();
        const course = (data.course || 'BRAHMOS: IPE + NEET Medical (Bi.P.C)').trim();
        const studentClass = (data.class || '').trim();
        const state = (data.state || 'Andhra Pradesh').trim();
        const district = (data.district || data.city || 'Vijayawada (NTR Dist)').trim();
        const campusType = (data.campus_type || data.hostel || 'Residential (A/C Class + Non-A/C Hostel + Food)').trim();
        const source = normalizeSource(data.source);
        const notes = (data.notes || data.message || 'Admissions Enquiry').trim();

        // Validation
        if (!name || name.length < 2) {
            return res.status(400).json({ error: 'Valid student name is required' });
        }
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
        }
        const phone10 = cleanPhone.slice(-10);

        const record = {
            enquiry_id: enquiryId,
            registration_id: enquiryId,
            timestamp: dateStr,
            name,
            phone: phone10,
            email: email || '',
            year,
            course,
            class: studentClass,
            state,
            district,
            campus_type: campusType,
            source,
            notes,
            status: 'Pending'
        };

        // Format exact 14 columns
        const row = [
            1,                     // S.No. (recomputed during Google Sheet sync)
            enquiryId,             // Registration ID
            dateStr,               // Submission Date & Time
            year,                  // Academic Year
            state,                 // State
            district,              // Campus Location & District
            campusType,            // Campus Type
            studentClass,          // Selected Class
            course,                // Selected Course / Program
            name,                  // Student Name
            email,                 // Email Address
            phone10,               // Phone Number
            source,                // Registration Source (Website Form / AI Chatbot)
            'Pending'              // Registration Status
        ];

        // 1. Dispatch FormSubmit email in background (unchanged)
        try {
            await fetch(`https://formsubmit.co/ajax/${NOTIFICATION_EMAIL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'ShreeGurusAdmissionsAPI/1.0'
                },
                body: JSON.stringify({
                    '_subject': `New Shree Gurus Admission Enquiry - ${name} (${course})`,
                    '_replyto': email ? email : NOTIFICATION_EMAIL,
                    'Enquiry ID': enquiryId,
                    'Student Name': name,
                    'Phone / WhatsApp': phone10,
                    'Email Address': email || 'Not Provided',
                    'Course': course,
                    'Academic Year': year,
                    'Class': studentClass || 'Not Specified',
                    'State': state,
                    'Location / District': district,
                    'Campus Type': campusType,
                    'Source': source,
                    'Notes / Remarks': notes,
                    'Submission Time': dateStr
                })
            });
        } catch (mailErr) {
            console.error('Email dispatch error:', mailErr);
        }

        // 2. Synchronize to Google Sheet
        const sheetRes = await syncToGoogleSheets(row, enquiryId);

        return res.status(200).json({
            success: true,
            enquiry_id: enquiryId,
            registration_id: enquiryId,
            s_no: sheetRes.s_no || null,
            google_sheet_synced: sheetRes.synced || false,
            message: 'Admission enquiry successfully received. Our Academic Dean will contact you shortly.',
            data: record
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
