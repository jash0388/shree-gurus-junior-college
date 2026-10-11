/**
 * Vercel Serverless Function: /api/enquiry
 * Handles Admission Enquiries and Chatbot Registrations for Shree Gurus Group of Institutions.
 */

const NOTIFICATION_EMAIL = 'mail2shreegurus@gmail.com';

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
        const idSuffix = String(now.getFullYear()).slice(-2) +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0');
        const enquiryId = `SG-${idSuffix}`;

        const name = (data.student_name || data.name || '').trim();
        const phone = (data.phone || '').trim();
        const email = (data.email || '').trim();
        const year = (data.year || data.academic_year || '2026 - 2027 (Active Intake)').trim();
        const course = (data.course || 'BRAHMOS: IPE + NEET Medical (Bi.P.C)').trim();
        const studentClass = (data.class || 'Class 11 / Intermediate 1st Year').trim();
        const state = (data.state || 'Andhra Pradesh').trim();
        const district = (data.district || data.city || 'Vijayawada (NTR Dist)').trim();
        const campusType = (data.campus_type || data.hostel || 'Residential (Hostel + Food + 24/7 Mentoring)').trim();
        const source = (data.source || 'Guru AI Chatbot').trim();
        const notes = (data.notes || data.message || 'Admissions Enquiry').trim();

        // Validation
        if (!name || name.length < 2) {
            return res.status(400).json({ error: 'Valid student name is required' });
        }
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
            return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
        }

        const record = {
            enquiry_id: enquiryId,
            timestamp: dateStr,
            name,
            phone: cleanPhone.slice(-10),
            email: email || 'Not Provided',
            year,
            course,
            class: studentClass,
            state,
            district,
            campus_type: campusType,
            source,
            notes,
            status: 'Pending Followup'
        };

        // Dispatch FormSubmit email in background
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
                    '_replyto': email.includes('@') ? email : NOTIFICATION_EMAIL,
                    'Enquiry ID': enquiryId,
                    'Student Name': name,
                    'Phone / WhatsApp': record.phone,
                    'Email Address': record.email,
                    'Course': course,
                    'Academic Year': year,
                    'Class': studentClass,
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

        return res.status(200).json({
            success: true,
            enquiry_id: enquiryId,
            message: 'Admission enquiry successfully received. Our Academic Dean will contact you shortly.',
            data: record
        });
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
